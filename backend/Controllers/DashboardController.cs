using backend.DTOs.Dashboard;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<DashboardResponseDto>> GetDashboard()
        {
            var result = await _dashboardService.GetDashboardDataAsync();
            return Ok(result);
        }
    }
}