namespace Tribean.DTOs;

public class UpdateCartItemDto
{
    public string ProductId { get; set; }
    public string SizeId { get; set; }
    public int Quantity { get; set; }
}