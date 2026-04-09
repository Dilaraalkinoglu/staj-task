using backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Company> Companies => Set<Company>();
        public DbSet<Transaction> Transactions => Set<Transaction>();
        public DbSet<Account> Accounts => Set<Account>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    FullName = "Admin User",
                    Email = "admin@test.com",
                    Password = "123456",
                    Role = "Admin",
                    IsActive = true
                },
                new User
                {
                    Id = 2,
                    FullName = "Operasyon Kullanıcısı",
                    Email = "operator@test.com",
                    Password = "123456",
                    Role = "Operator",
                    IsActive = true
                },
                new User
                {
                    Id = 3,
                    FullName = "Finans Kullanıcısı",
                    Email = "finance@test.com",
                    Password = "123456",
                    Role = "Finance",
                    IsActive = true
                },
                new User
                {
                    Id = 4,
                    FullName = "Pasif Kullanıcı",
                    Email = "inactive@test.com",
                    Password = "123456",
                    Role = "User",
                    IsActive = false
                }
            );

            // Company ve Transaction arasındaki ilişkiyi tanımla
            modelBuilder.Entity<Company>()
                .HasMany(c => c.Transactions)
                .WithOne(t => t.Company)
                .HasForeignKey(t => t.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}