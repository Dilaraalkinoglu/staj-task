using System.ComponentModel.DataAnnotations;

namespace backend.Entities
{
    public class Company
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string TaxNumber { get; set; } = string.Empty;

        [Required]
        public string City { get; set; } = string.Empty;

        [Required]
        public string Sector { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; } 

        // 1 company can have many transactions (1 -> N)
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}