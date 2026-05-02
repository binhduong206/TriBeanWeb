namespace Tribean.DTOs;

public class CartItemRequestDto
{
    public string ProductId { get; set; }
    public string SizeId { get; set; }
    public int Quantity { get; set; } = 1;
}