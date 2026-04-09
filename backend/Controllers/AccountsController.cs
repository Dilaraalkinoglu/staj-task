using backend.Data;
using backend.Entities;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/accounts")]
    [Authorize]
    public class AccountsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AccountsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            var accounts = await _context.Accounts.OrderBy(a => a.AccountCode).ToListAsync();
            return Ok(accounts);
        }

        [HttpPost("upload-excel")]
        public async Task<ActionResult> UploadExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Dosya boş.");

            ExcelPackage.License.SetNonCommercialPersonal("Dilara Alkinoglu");

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            stream.Position = 0;

            using var package = new ExcelPackage(stream);
            var worksheet = package.Workbook.Worksheets["Accounts"];
            
            if (worksheet == null)
            {
                return BadRequest("Excel dosyasında 'Accounts' sayfası bulunamadı.");
            }

            var rowCount = worksheet.Dimension?.Rows ?? 0;
            var addedAccounts = new List<object>();

            for (int row = 2; row <= rowCount; row++)
            {
                var code = worksheet.Cells[row, 1].Text.Trim();
                var name = worksheet.Cells[row, 2].Text.Trim();
                var group = worksheet.Cells[row, 3].Text.Trim();

                if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(name))
                    continue;

                var existingAccount = await _context.Accounts.FindAsync(code);
                if (existingAccount == null)
                {
                    var acc = new Account { AccountCode = code, AccountName = name, AccountGroup = group };
                    _context.Accounts.Add(acc);
                    addedAccounts.Add(acc);
                }
                else
                {
                    existingAccount.AccountName = name;
                    existingAccount.AccountGroup = group;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Hesap planı başarıyla güncellendi.",
                AddedCount = addedAccounts.Count
            });
        }
    }
}
