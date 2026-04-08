using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities
{
    public class Transaction
    {
        public int Id { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [ForeignKey("CompanyId")]
        public Company Company { get; set; } = null!;

        public DateTime Date { get; set; }

        public string DocumentNo { get; set; } = string.Empty;

        public string AccountCode { get; set; } = string.Empty;

        public string AccountName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public decimal Debit { get; set; }
    
        [Required]
        public decimal Credit { get; set; }

        [NotMapped]
        public decimal NetEffect => Credit - Debit;

        public string TransactionType { get; set; } = string.Empty;
        
        public string EntryMethod { get; set; } = string.Empty;

        public string Currency { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

    }
}