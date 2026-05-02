using System.ComponentModel.DataAnnotations;

namespace Tribean.DTOs;

public class RegisterRequestDto
{
    public string Password { get; set; } = string.Empty;
    [MaxLength(50)]
    public string? FirstName { get; set; }

    [MaxLength(50)]
    public string? LastName { get; set; }
    [EmailAddress, MaxLength(100)]
    public string? Email { get; set; }
}