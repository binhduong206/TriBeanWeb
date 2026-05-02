using System.ComponentModel.DataAnnotations;

namespace Tribean.DTOs.Auth
{
    public class LoginRequestDto
    {
        // [Required]
        // public string UserName { get; set; }
        [Required(ErrorMessage = "Vui lòng nhập tên đăng nhập")]
        [EmailAddress]
        public string Email { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập mật khẩu")]
        public string Password { get; set; }
    }
}