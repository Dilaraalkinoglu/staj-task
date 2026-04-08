namespace backend.DTOs.Transaction
{
    public class TransactionCreateDto
    {
        public int CompanyId { get; set; }

        public DateTime Date { get; set; }

        public string DocumentNo { get; set; } = string.Empty;

        public string AccountCode { get; set; } = string.Empty;

        public string AccountName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Debit { get; set; }
    
        public decimal Credit { get; set; }

        public string TransactionType { get; set; } = string.Empty;
        
        public string EntryMethod { get; set; } = string.Empty;

        public string Currency { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;
    }
}