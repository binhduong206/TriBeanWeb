using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tribean.Data;
using Tribean.DTOs;
using Tribean.DTOs.Auth;
using Tribean.Services;

namespace Tribean.Controllers.Api
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var newUser = await _authService.RegisterAsync(request);

            if (newUser == null)
            {
                return BadRequest(new { message = "Đăng ký thất bại. Email có thể đã tồn tại hoặc dữ liệu không hợp lệ!" });
            }

            return Ok(new
            {
                success = true,
                message = "Đăng ký thành công",
                data = new { id = newUser.Id, email = newUser.Email, fullName = $"{newUser.FirstName} {newUser.LastName}" }
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var responseData = await _authService.LoginAsync(request);

            if (responseData == null)
            {
                return Unauthorized(new { message = "Sai tên đăng nhập hoặc mật khẩu!" });
            }

            return Ok(responseData);
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestDto request)
        {
            await _authService.RevokeRefreshTokenAsync(request.RefreshToken);
            return Ok(new { message = "Đăng xuất thành công" });
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpGet("me")]
        public ActionResult AuthenticatedOnlyEndPoint()
        {
            return Ok("You are authenticated!");
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var responseData = await _authService.RefreshAccessTokenAsync(request.RefreshToken);

            if (responseData == null)
            {
                return Unauthorized(new { message = "Refresh token không hợp lệ hoặc đã hết hạn!" });
            }

            return Ok(responseData);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest(new { message = "Email is required" });

            await _authService.ForgotPasswordAsync(dto.Email);

            // Luôn trả về success — không tiết lộ email có tồn tại không
            return Ok(new { message = "If this email exists, a reset link has been sent." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Token) || string.IsNullOrWhiteSpace(dto.NewPassword))
                return BadRequest(new { message = "Token and new password are required" });

            if (dto.NewPassword.Length < 6)
                return BadRequest(new { message = "Password must be at least 6 characters" });

            var success = await _authService.ResetPasswordAsync(dto.Token, dto.NewPassword);

            if (!success)
                return BadRequest(new { message = "Token is invalid or expired" });

            return Ok(new { message = "Password reset successfully" });
        }
    }
}