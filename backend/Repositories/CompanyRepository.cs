using backend.Data;
using backend.Entities;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class CompanyRepository : ICompanyRepository
    {
        private readonly AppDbContext _context;

        public CompanyRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Company>> GetAllAsync()
        {
            return await _context.Companies
                .OrderBy(c => c.Id)
                .ToListAsync();
        }

        public async Task<Company?> GetByIdAsync(int id)
        {
            return await _context.Companies
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<List<Company>> SearchByNameAsync(string name)
        {
            return await _context.Companies
                .Where(c => c.Name.ToLower().Contains(name.ToLower()))
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<Company?> GetByTaxNumberAsync(string taxNumber)
        {
            return await _context.Companies
                .FirstOrDefaultAsync(c => c.TaxNumber == taxNumber);
        }

        public async Task AddAsync(Company company)
        {
            await _context.Companies.AddAsync(company);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}