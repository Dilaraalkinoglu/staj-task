namespace backend.DTOs.Company
{
    public class CompanyResponseDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string TaxNumber { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public string Sector { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}