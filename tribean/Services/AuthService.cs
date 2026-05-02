using BCrypt.Net;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Tribean.DTOs;
using Tribean.DTOs.Auth;
using Tribean.Mappers;
using Tribean.Models;
using Tribean.Repositories;

namespace Tribean.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _repo;
        private readonly IConfiguration _config;
        private readonly ICartRepository _cartRepo;
        private readonly IEmailService _emailService;

        public AuthService(IAuthRepository repo, IConfiguration config, ICartRepository cartRepo, IEmailService emailService)
        {
            _emailService = emailService;
            _repo = repo;
            _config = config;
            _cartRepo = cartRepo;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _repo.GetUserByEmailAsync(request.Email);
            if (user == null) return null;

            // Check raw password
            if (user.Password == request.Password)
            {
                string hashed = BCrypt.Net.BCrypt.HashPassword(request.Password);
                await _repo.UpdatePasswordAsync(user, hashed);
                user.Password = hashed;
            }

            // Verify BCrypt password
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                return null;
            }

            var userInfo = user.ToUserInfoDto();

            // Generate Access Token (1 minute for testing)
            var (accessToken, accessTokenExpiry) = GenerateAccessToken(user);

            // Generate Refresh Token (7 days)
            var refreshToken = GenerateRefreshToken();
            var refreshDays = int.Parse(_config["Jwt:RefreshTokenDays"]);
            var refreshTokenExpiry = DateTime.UtcNow.AddDays(refreshDays);

            await _repo.SaveRefreshTokenAsync(user.Id, refreshToken, refreshTokenExpiry);
            await _repo.SaveChangesAsync();

            return new LoginResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                AccessTokenExpiration = accessTokenExpiry,
                RefreshTokenExpiration = refreshTokenExpiry,
                User = userInfo
            };
        }

        public async Task<User> RegisterAsync(RegisterRequestDto request)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return null;

            // Check if email already exists
            var existingUser = await _repo.GetUserByEmailAsync(request.Email);
            if (existingUser != null)
                return null;

            // Hash password
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Get default role (Customer)
            var defaultRole = await _repo.GetDefaultRoleAsync();
            if (defaultRole == null)
                return null;

            // Create new user
            var newUser = new User
            {
                Email = request.Email,
                UserName = request.Email, // Use email as username
                Password = hashedPassword,
                FirstName = request.FirstName ?? string.Empty,
                LastName = request.LastName ?? string.Empty,
                RoleId = defaultRole.Id,
                CreatedAt = DateTime.UtcNow
            };

            var createdUser = await _repo.CreateUserAsync(newUser);
            await _repo.SaveChangesAsync();

            var cart = new Cart
            {
                UserId = createdUser.Id,
                CartItems = new List<CartItem>()
            };

            await _cartRepo.CreateCartAsync(cart);
            await _repo.SaveChangesAsync();

            return createdUser;
        }

        public async Task<RefreshTokenResponseDto> RefreshAccessTokenAsync(string refreshToken)
        {
            // Validate refresh token from database
            var storedToken = await _repo.GetRefreshTokenAsync(refreshToken);

            if (storedToken == null || storedToken.User == null || storedToken.IsRevoked || storedToken.ExpiryDate < DateTime.UtcNow)
                return null;

            // Generate new access token
            var (newAccessToken, expiry) = GenerateAccessToken(storedToken.User);
            var newRefreshToken = GenerateRefreshToken();
            var newRefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

            // Revoke old refresh token
            await _repo.RevokeRefreshTokenAsync(refreshToken);

            // Save new refresh token
            await _repo.SaveRefreshTokenAsync(storedToken.UserId, newRefreshToken, newRefreshTokenExpiry);
            await _repo.SaveChangesAsync();

            return new RefreshTokenResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                Expiration = DateTime.UtcNow.AddMinutes(5)
            };
        }

        private (string token, DateTime expiry) GenerateAccessToken(Models.User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName)
            };

            if (user.Role != null)
                claims.Add(new Claim(ClaimTypes.Role, user.Role.RoleName));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

            var minutes = int.Parse(_config["Jwt:AccessTokenMinutes"]);
            var expireTime = DateTime.UtcNow.AddMinutes(minutes);
            Console.WriteLine("EXPIRE: " + expireTime);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: expireTime,
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
            Console.WriteLine("TOKEN: " + tokenString);

            return (tokenString, expireTime);
        }

        public async Task<bool> RevokeRefreshTokenAsync(string token)
        {
            return await _repo.RevokeRefreshTokenAsync(token);
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
        }

        public async Task ForgotPasswordAsync(string email)
        {
            var user = await _repo.GetUserByEmailAsync(email);

            // Không tiết lộ email có tồn tại không
            if (user == null) return;

            // Generate token
            var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
            user.ResetPasswordToken = token;
            user.ResetPasswordTokenExpiry = DateTime.UtcNow.AddMinutes(15);

            await _repo.SaveChangesAsync();

            // Gửi email
            var frontendUrl = _config["Frontend:BaseUrl"];
            var resetLink = $"{frontendUrl}/pages/auth/reset-password.html?token={token}";
            await _emailService.SendResetPasswordEmailAsync(email, resetLink);
        }

        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            var user = await _repo.GetUserByResetTokenAsync(token);
            if (user == null) return false;

            // Hash password mới
            user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);

            // Xóa token sau khi dùng — chỉ dùng được 1 lần
            user.ResetPasswordToken = null;
            user.ResetPasswordTokenExpiry = null;

            await _repo.SaveChangesAsync();
            return true;
        }

    }
}