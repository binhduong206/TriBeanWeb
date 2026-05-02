using Tribean.Models;

namespace Tribean.Repositories
{
    public interface IAuthRepository
    {
        Task<User> GetUserByEmailAsync(string email);
        Task<User> CreateUserAsync(User user);
        Task UpdatePasswordAsync(User user, string hashedPass);
        Task<Role> GetDefaultRoleAsync();
        Task<bool> SaveRefreshTokenAsync(string userId, string refreshToken, DateTime expiryDate);
        Task<RefreshToken> GetRefreshTokenAsync(string token);
        Task<bool> RevokeRefreshTokenAsync(string token);
        Task<User?> GetUserByResetTokenAsync(string token);
        Task SaveChangesAsync();
    }
}