using System.ComponentModel.DataAnnotations;

namespace backend.Entities
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        [Required]
        public String Role { get; set; } = string.Empty;

        public bool IsActive { get; set; }
    }
}