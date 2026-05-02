using Microsoft.EntityFrameworkCore;
using Tribean.Data;
using Tribean.Models;

namespace Tribean.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly ApplicationDbContext _db;

        public AuthRepository(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await _db.Users
                .Include(u => u.Role!)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> CreateUserAsync(User user)
        {
            _db.Users.Add(user);
            return user;
        }

        public async Task<Role> GetDefaultRoleAsync()
        {
            return await _db.Roles.FirstOrDefaultAsync(r => r.RoleName.ToLower() == "client");
        }

        public async Task UpdatePasswordAsync(User user, string hashedPass)
        {
            user.Password = hashedPass;
        }

        public async Task<bool> SaveRefreshTokenAsync(string userId, string refreshToken, DateTime expiryDate)
        {
            try
            {
                var token = new RefreshToken
                {
                    UserId = userId,
                    Token = refreshToken,
                    ExpiryDate = expiryDate,
                    IsRevoked = false
                };
                _db.RefreshTokens.Add(token);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<RefreshToken> GetRefreshTokenAsync(string token)
        {
            return await _db.RefreshTokens
                .Include(rt => rt.User)
                .ThenInclude(u => u.Role)
                .FirstOrDefaultAsync(rt => rt.Token == token && !rt.IsRevoked && rt.ExpiryDate > DateTime.UtcNow);
        }

        public async Task<bool> RevokeRefreshTokenAsync(string token)
        {
            try
            {
                var refreshToken = await _db.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == token);
                if (refreshToken == null)
                    return false;

                refreshToken.IsRevoked = true;
                _db.RefreshTokens.Update(refreshToken);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<User?> GetUserByResetTokenAsync(string token)
        {
            return await _db.Users
                .FirstOrDefaultAsync(u =>
                    u.ResetPasswordToken == token &&
                    u.ResetPasswordTokenExpiry > DateTime.UtcNow);
        }

        public async Task SaveChangesAsync()
        {
            await _db.SaveChangesAsync();
        }
    }
}