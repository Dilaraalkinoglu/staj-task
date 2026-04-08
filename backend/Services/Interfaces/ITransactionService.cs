using backend.DTOs.Transaction;

namespace backend.Services.Interfaces
{
    public interface ITransactionService
    {
        Task<List<TransactionResponseDto>> GetAllAsync();

        Task<TransactionResponseDto?> GetByIdAsync(int id);

        Task<List<TransactionResponseDto>> GetByCompanyIdAsync(int companyId);

        Task<TransactionResponseDto> AddAsync(TransactionCreateDto dto);

        Task<bool> ExistsAsync(int companyId, string documentNo, string accountCode, DateTime date);
    }
}