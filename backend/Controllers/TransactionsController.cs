using backend.DTOs.Transaction;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using OfficeOpenXml;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/transactions")]
    [Authorize]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public TransactionsController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpGet]
        public async Task<ActionResult<List<TransactionResponseDto>>> GetAll()
        {
            var transactions = await _transactionService.GetAllAsync();
            return Ok(transactions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TransactionResponseDto>> GetById(int id)
        {
            var transaction = await _transactionService.GetByIdAsync(id);
            if (transaction == null)
            {
                return NotFound();
            }
            return Ok(transaction);
        }

        [HttpGet("company/{companyId}")]
        public async Task<ActionResult<List<TransactionResponseDto>>> GetByCompanyId(int companyId)
        {
            var transactions = await _transactionService.GetByCompanyIdAsync(companyId);
            return Ok(transactions);
        }

        [HttpPost]
        public async Task<ActionResult<TransactionResponseDto>> Add([FromBody] TransactionCreateDto dto)
        {
            try
            {
                var createdTransaction = await _transactionService.AddAsync(dto);
                return Ok(createdTransaction);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("upload-excel")]
        public async Task<ActionResult> UploadExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("Dosya boş.");
            }

            ExcelPackage.License.SetNonCommercialPersonal("Dilara Alkinoglu");

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            stream.Position = 0;

            using var package = new ExcelPackage(stream);
            var isNewFormat = false;
            var worksheet = package.Workbook.Worksheets["Transactions"];
            if (worksheet != null)
            {
                isNewFormat = true;
            }
            else
            {
                worksheet = package.Workbook.Worksheets["Upload_Transactions_Template"];
            }

            if (worksheet == null)
            {
                return BadRequest("Excel dosyasında 'Transactions' veya 'Upload_Transactions_Template' sayfası bulunamadı.");
            }

            var rowCount = worksheet.Dimension?.Rows ?? 0;
            if (rowCount < 2)
            {
                return BadRequest("Excel dosyasında işlenecek veri bulunamadı.");
            }

            var addedTransactions = new List<object>();
            var skippedTransactions = new List<object>();

            for (int row = 2; row <= rowCount; row++)
            {
                try
                {
                    string companyIdText, dateText, documentNo, accountCode, accountName, description, debitText, creditText, transactionType, entryMethod, currency, status;

                    if (isNewFormat)
                    {
                        companyIdText = worksheet.Cells[row, 2].Text.Trim();
                        dateText = worksheet.Cells[row, 4].Text.Trim();
                        documentNo = worksheet.Cells[row, 5].Text.Trim();
                        accountCode = worksheet.Cells[row, 6].Text.Trim();
                        accountName = worksheet.Cells[row, 7].Text.Trim();
                        description = worksheet.Cells[row, 8].Text.Trim();
                        debitText = worksheet.Cells[row, 9].Text.Trim();
                        creditText = worksheet.Cells[row, 10].Text.Trim();
                        // 11 is NetEffect
                        transactionType = worksheet.Cells[row, 12].Text.Trim();
                        entryMethod = worksheet.Cells[row, 13].Text.Trim();
                        currency = worksheet.Cells[row, 14].Text.Trim();
                        status = worksheet.Cells[row, 15].Text.Trim();
                    }
                    else
                    {
                        companyIdText = worksheet.Cells[row, 1].Text.Trim();
                        dateText = worksheet.Cells[row, 2].Text.Trim();
                        documentNo = worksheet.Cells[row, 3].Text.Trim();
                        accountCode = worksheet.Cells[row, 4].Text.Trim();
                        accountName = worksheet.Cells[row, 5].Text.Trim();
                        description = worksheet.Cells[row, 6].Text.Trim();
                        debitText = worksheet.Cells[row, 7].Text.Trim();
                        creditText = worksheet.Cells[row, 8].Text.Trim();
                        transactionType = worksheet.Cells[row, 9].Text.Trim();
                        entryMethod = worksheet.Cells[row, 10].Text.Trim();
                        currency = "TRY"; // Default
                        status = "Onaylı"; // Default
                    }

                    // Tamamen boş satırı atla
                    if (string.IsNullOrWhiteSpace(companyIdText) &&
                        string.IsNullOrWhiteSpace(dateText) &&
                        string.IsNullOrWhiteSpace(documentNo))
                    {
                        continue;
                    }

                    if (!int.TryParse(companyIdText, out int companyId))
                    {
                        skippedTransactions.Add(new
                        {
                            Row = row,
                            Reason = "CompanyId geçerli bir sayı değil."
                        });
                        continue;
                    }

                    if (!DateTime.TryParse(dateText, out DateTime date))
                    {
                        skippedTransactions.Add(new
                        {
                            Row = row,
                            Reason = "Date alanı geçerli bir tarih değil."
                        });
                        continue;
                    }

                    if (!decimal.TryParse(debitText, out decimal debit))
                    {
                        debit = 0;
                    }

                    if (!decimal.TryParse(creditText, out decimal credit))
                    {
                        credit = 0;
                    }

                    var dto = new TransactionCreateDto
                    {
                        CompanyId = companyId,
                        Date = DateTime.SpecifyKind(date, DateTimeKind.Utc),
                        DocumentNo = documentNo,
                        AccountCode = accountCode,
                        AccountName = accountName,
                        Description = description,
                        Debit = debit,
                        Credit = credit,
                        TransactionType = transactionType,
                        EntryMethod = string.IsNullOrWhiteSpace(entryMethod) ? "ExcelUpload" : entryMethod,
                        Currency = currency,
                        Status = status
                    };

                    var isDuplicate = await _transactionService.ExistsAsync(
                        dto.CompanyId,
                        dto.DocumentNo,
                        dto.AccountCode,
                        dto.Date
                    );

                    if (isDuplicate)
                    {
                        skippedTransactions.Add(new
                        {
                            Row = row,
                            CompanyId = dto.CompanyId,
                            DocumentNo = dto.DocumentNo,
                            AccountCode = dto.AccountCode,
                            Reason = "Bu işlem zaten mevcut."
                        });
                        continue;
                    }

                    var createdTransaction = await _transactionService.AddAsync(dto);

                    addedTransactions.Add(new
                    {
                        createdTransaction.Id,
                        createdTransaction.CompanyId,
                        createdTransaction.DocumentNo,
                        createdTransaction.Debit,
                        createdTransaction.Credit
                    });
                }
                catch (Exception ex)
                {
                    skippedTransactions.Add(new
                    {
                        Row = row,
                        Reason = ex.Message
                    });
                }
            }

            return Ok(new
            {
                Message = "Transaction excel verileri işlendi.",
                AddedCount = addedTransactions.Count,
                SkippedCount = skippedTransactions.Count,
                AddedTransactions = addedTransactions,
                SkippedTransactions = skippedTransactions
            });
        }
    }
}