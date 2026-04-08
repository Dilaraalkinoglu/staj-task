namespace backend.DTOs.Dashboard
{
    public class CompanySummaryDto
    {
        public string CompanyName { get; set; } = string.Empty;
        public int RecordCount { get; set; }
        public decimal TotalDebit { get; set; }
        public decimal TotalCredit { get; set; }
        public decimal Net { get; set; }
    }
}