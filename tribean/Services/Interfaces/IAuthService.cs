using Tribean.DTOs;
using Tribean.DTOs.Auth;
using Tribean.Models;

namespace Tribean.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
        Task<User> RegisterAsync(RegisterRequestDto request);
        Task<RefreshTokenResponseDto> RefreshAccessTokenAsync(string refreshToken);
        Task<bool> RevokeRefreshTokenAsync(string token);
        Task ForgotPasswordAsync(string email);
        Task<bool> ResetPasswordAsync(string token, string newPassword);
    }
}