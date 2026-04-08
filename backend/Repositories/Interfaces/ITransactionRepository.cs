using backend.Entities;

namespace backend.Repositories.Interfaces
{
    public interface ITransactionRepository
    {
        Task<List<Transaction>> GetAllAsync();

        Task<Transaction?> GetByIdAsync(int id);

        Task<List<Transaction>> GetByCompanyIdAsync(int companyId);

        Task AddAsync(Transaction transaction);

        Task SaveChangesAsync();

        Task<bool> ExistsAsync(int companyId, string documentNo, string accountCode, DateTime date);
    }
}