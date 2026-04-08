namespace backend.DTOs.Dashboard
{
    public class MonthlyNetEffectDto
    {
        public string Month { get; set; } = string.Empty;
        public decimal Net { get; set; }
    }
}