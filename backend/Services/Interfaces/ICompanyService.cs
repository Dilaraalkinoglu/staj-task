using backend.DTOs.Company;

namespace backend.Services.Interfaces
{
    public interface ICompanyService
    {
        Task<List<CompanyResponseDto>> GetAllAsync();
        Task<CompanyResponseDto?> GetByIdAsync(int id);
        Task<List<CompanyResponseDto>> SearchByNameAsync(string name);
        Task<CompanyResponseDto> AddAsync(CompanyCreateDto request);
    }
}