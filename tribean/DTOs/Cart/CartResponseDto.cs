namespace Tribean.DTOs;

public class CartResponseDto
{
    public string CartId { get; set; }
    public string UserId { get; set; }
    public List<CartItemResponseDto> Items { get; set; } = new();
    public decimal TotalAmount { get; set; }
}