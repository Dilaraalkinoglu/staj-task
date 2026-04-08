namespace backend.DTOs.Dashboard
{
    public class DashboardSummaryDto
    {
        public int TotalCompanies { get; set; }
        public int ActiveCompanies { get; set; }
        public int TotalRecords { get; set; }
        public decimal TotalDebit { get; set; }
        public decimal TotalCredit { get; set; }
        public decimal NetEffect { get; set; }
        public decimal TotalIncome { get; set; }
        public decimal TotalExpense { get; set; }
        public int ExcelUploadedRecords { get; set; }
        public int ManualEnteredRecords { get; set; }
    }
}