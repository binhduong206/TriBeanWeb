namespace Tribean.DTOs;

public class CartItemResponseDto
{
    public string ProductId { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;

    public string SizeId { get; set; } = string.Empty;
    public string SizeName { get; set; } = string.Empty;

    public decimal Price { get; set; }
    public int Discount { get; set; }
    public decimal FinalPrice { get; set; }

    public int Quantity { get; set; }
    public decimal Total { get; set; }
}