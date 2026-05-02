using System;

namespace Tribean.DTOs.Auth
{
    public class LoginResponseDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime AccessTokenExpiration { get; set; }
        public DateTime RefreshTokenExpiration { get; set; }
        public UserInfoDto User { get; set; }
    }

    public class UserInfoDto
    {
        public string UserId { get; set; }
        public string FullName { get; set; }
        public string Avatar { get; set; }
    }
}