using backend.DTOs.Company;
using backend.Entities;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class CompanyService : ICompanyService
    {
        private readonly ICompanyRepository _companyRepository;

        public CompanyService(ICompanyRepository companyRepository)
        {
            _companyRepository = companyRepository;
        }

        public async Task<List<CompanyResponseDto>> GetAllAsync()
        {
            var companies = await _companyRepository.GetAllAsync();

            return companies.Select(MapToResponseDto).ToList();
        }

        public async Task<CompanyResponseDto?> GetByIdAsync(int id)
        {
            var company = await _companyRepository.GetByIdAsync(id);

            if (company == null) 
                return null;

            return MapToResponseDto(company);
        }

        public async Task<List<CompanyResponseDto>> SearchByNameAsync(string name)
        {
            var companies = await _companyRepository.SearchByNameAsync(name);
            
            return companies.Select(MapToResponseDto).ToList();
        }

        public async Task<CompanyResponseDto> AddAsync(CompanyCreateDto request)
        {
            var existingCompany = await _companyRepository.GetByTaxNumberAsync(request.TaxNumber);
            
            if (existingCompany != null)
            {
                throw new Exception("Bu vergi numarasına sahip bir firma zaten mevcut.");
            }

            var company = new Company
            {
                Name = request.Name,
                TaxNumber = request.TaxNumber,
                City = request.City,
                Sector = request.Sector,
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            await _companyRepository.AddAsync(company);
            await _companyRepository.SaveChangesAsync();

            return MapToResponseDto(company);
        }

        private static CompanyResponseDto MapToResponseDto(Company company)
        {
            return new CompanyResponseDto
            {
                Id = company.Id,
                Name = company.Name,
                TaxNumber = company.TaxNumber,
                City = company.City,
                Sector = company.Sector,
                IsActive = company.IsActive,
                CreatedAt = company.CreatedAt
            };
        }
    }
}