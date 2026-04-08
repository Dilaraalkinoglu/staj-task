using backend.DTOs.Dashboard;

namespace backend.Services.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardResponseDto> GetDashboardDataAsync();
    }
}