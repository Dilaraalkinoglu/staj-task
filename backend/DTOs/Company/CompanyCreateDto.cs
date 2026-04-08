using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Company
{
    public class CompanyCreateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string TaxNumber { get; set; } = string.Empty;

        [Required]
        public string City { get; set; } = string.Empty;

        [Required]
        public string Sector { get; set; } = string.Empty;

        public bool IsActive { get; set; }
    }
}