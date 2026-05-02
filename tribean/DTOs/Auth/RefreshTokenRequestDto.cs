using System.ComponentModel.DataAnnotations;

namespace Tribean.DTOs.Auth;

public class RefreshTokenRequestDto
{
    [Required(ErrorMessage = "Refresh Token không được để trống")]
    public string RefreshToken { get; set; } = string.Empty;
}
