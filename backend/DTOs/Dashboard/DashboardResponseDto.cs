using System.Collections.Generic;

namespace backend.DTOs.Dashboard
{
    public class DashboardResponseDto
    {
        public DashboardSummaryDto Summary { get; set; } = new();
        public List<MonthlyNetEffectDto> MonthlyNetEffects { get; set; } = new();
        public List<CompanySummaryDto> CompanySummaries { get; set; } = new();
    }
}