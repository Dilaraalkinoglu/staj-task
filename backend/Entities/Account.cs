using System.ComponentModel.DataAnnotations;

namespace backend.Entities
{
    public class Account
    {
        [Key]
        public string AccountCode { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public string AccountGroup { get; set; } = string.Empty;
    }
}
