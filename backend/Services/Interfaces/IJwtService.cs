using backend.Entities;

namespace backend.Services.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}