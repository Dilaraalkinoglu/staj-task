using backend.DTOs.Transaction;
using backend.Entities;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly ICompanyRepository _companyRepository;

        public TransactionService(ITransactionRepository transactionRepository,
            ICompanyRepository companyRepository)
        {
            _transactionRepository = transactionRepository;
            _companyRepository = companyRepository;
        }

        public async Task<List<TransactionResponseDto>> GetAllAsync()
        {
            var transactions = await _transactionRepository.GetAllAsync();
            return transactions.Select(MapToResponseDto).ToList();
        }

        public async Task<TransactionResponseDto?> GetByIdAsync(int id)
        {
            var transaction = await _transactionRepository.GetByIdAsync(id);
            return transaction == null ? null : MapToResponseDto(transaction);
        }

        public async Task<List<TransactionResponseDto>> GetByCompanyIdAsync(int companyId)
        {
            var transactions = await _transactionRepository.GetByCompanyIdAsync(companyId);
            return transactions.Select(MapToResponseDto).ToList();
        }

        public async Task<TransactionResponseDto> AddAsync(TransactionCreateDto dto)
        {
            var company = await _companyRepository.GetByIdAsync(dto.CompanyId);
            if (company == null)
            {
                throw new Exception("Firma bulunamadı.");
            }

             var utcDate = dto.Date.Kind switch
            {
                DateTimeKind.Utc => dto.Date,
                DateTimeKind.Local => dto.Date.ToUniversalTime(),
                _=> DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc)
            };

            var transaction = new Transaction
            {
                CompanyId = dto.CompanyId,
                Date = utcDate,
                DocumentNo = dto.DocumentNo,
                AccountCode = dto.AccountCode,
                AccountName = dto.AccountName,
                Description = dto.Description,
                Debit = dto.Debit,
                Credit = dto.Credit,
                TransactionType = dto.TransactionType,
                EntryMethod = dto.EntryMethod,
                Currency = dto.Currency,
                Status = dto.Status
            };

            await _transactionRepository.AddAsync(transaction);
            await _transactionRepository.SaveChangesAsync();

            // create işleminden sonra transaction.Id otomatik olarak set edilir, bu yüzden tekrar veritabanından çekiyoruz
            var createdTransaction = await _transactionRepository.GetByIdAsync(transaction.Id);

            return MapToResponseDto(createdTransaction!);
        }

        private static TransactionResponseDto MapToResponseDto(Transaction transaction)
        {
            return new TransactionResponseDto
            {
                Id = transaction.Id,
                CompanyId = transaction.CompanyId,
                CompanyName = transaction.Company?.Name ?? string.Empty,
                Date = transaction.Date,
                DocumentNo = transaction.DocumentNo,
                AccountCode = transaction.AccountCode,
                AccountName = transaction.AccountName,
                Description = transaction.Description,
                Debit = transaction.Debit,
                Credit = transaction.Credit,
                NetEffect = transaction.NetEffect,
                TransactionType = transaction.TransactionType,
                EntryMethod = transaction.EntryMethod,
                Currency = transaction.Currency,
                Status = transaction.Status
            };
        }

        public async Task<bool> ExistsAsync(int companyId, string documentNo, string accountCode, DateTime date)
        {
            var utcDate = date.Kind switch
            {
                DateTimeKind.Utc => date,
                DateTimeKind.Local => date.ToUniversalTime(),
                _ => DateTime.SpecifyKind(date, DateTimeKind.Utc)
            };

            return await _transactionRepository.ExistsAsync(companyId, documentNo, accountCode, utcDate);
        }
    }
}