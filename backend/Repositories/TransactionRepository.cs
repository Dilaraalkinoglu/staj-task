using backend.Data;
using backend.Entities;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class TransactionRepository : ITransactionRepository
    {
        private readonly AppDbContext _context;

        public TransactionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Transaction>> GetAllAsync()
        {
            return  await _context.Transactions
                .Include(t => t.Company)
                .OrderByDescending(t => t.Date)
                .ToListAsync();
        }

        public async Task<Transaction?> GetByIdAsync(int id)
        {
            return await _context.Transactions
                .Include(t => t.Company)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<List<Transaction>> GetByCompanyIdAsync(int companyId)
        {
            return await _context.Transactions
                .Where(t => t.CompanyId == companyId)
                .Include(t => t.Company)
                .OrderByDescending(t => t.Date)
                .ToListAsync();
        }

        public async Task AddAsync(Transaction transaction)
        {
            await _context.Transactions.AddAsync(transaction);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int companyId, string documentNo, string accountCode, DateTime date)
        {
            return await _context.Transactions.AnyAsync(t =>
                t.CompanyId == companyId &&
                t.DocumentNo == documentNo &&
                t.AccountCode == accountCode &&
                t.Date.Date == date.Date);
        }
    }
}