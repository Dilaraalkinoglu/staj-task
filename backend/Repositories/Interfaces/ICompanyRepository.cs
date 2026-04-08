using backend.Entities;

namespace backend.Repositories.Interfaces
{
    public interface ICompanyRepository
    {
        Task<List<Company>> GetAllAsync();
        Task<Company?> GetByIdAsync(int id);
        Task<List<Company>> SearchByNameAsync(string name);
        Task<Company?> GetByTaxNumberAsync(string taxNumber);
        Task AddAsync(Company company);
        Task SaveChangesAsync();
    }
}