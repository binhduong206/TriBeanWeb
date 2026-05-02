using Tribean.DTOs;
using Tribean.Models;

namespace Tribean.Mappers;

public static class CartMapper
{
    public static string BaseUrl = "http://localhost:5262";
    public static CartResponseDto ToCartResponse(Cart cart)
    {
        var items = cart.CartItems
            .Select(ci =>
            {
                var product = ci.Product;
                var size = ci.Size;

                if (product == null)
                    return null;

                var productPrice = product.Price * (1 - product.Discount / 100m);
                var finalPrice = productPrice;

                if (size != null)
                {
                    finalPrice += size.Price;
                }

                var image = BaseUrl + product.MainImgUrl;
                return new CartItemResponseDto
                {
                    ProductId = ci.ProductId,
                    ProductName = product.ProductName,
                    CategoryName = product.Category?.CategoryName ?? "",
                    Image = image,

                    SizeId = ci.SizeId,
                    SizeName = size?.SizeName ?? "",

                    Price = product.Price,
                    Discount = product.Discount,
                    FinalPrice = finalPrice,

                    Quantity = ci.Quantity,
                    Total = finalPrice * ci.Quantity
                };
            })
            .Where(x => x != null)
            .ToList();

        return new CartResponseDto
        {
            CartId = cart.Id,
            UserId = cart.UserId,
            Items = items!,
            TotalAmount = items.Sum(i => i.Total)
        };
    }
}
