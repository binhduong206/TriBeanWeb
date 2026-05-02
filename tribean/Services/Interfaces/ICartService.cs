using Tribean.DTOs;

namespace Tribean.Services;

public interface ICartService
{
    Task<CartResponseDto?> GetCart(string userId);
    Task<CartResponseDto?> AddCartItem(string userId, CartItemRequestDto item);
    Task<CartResponseDto?> UpdateCartItem(string userId, UpdateCartItemDto dto);
    Task<CartResponseDto?> RemoveCartItem(string userId, string productId, string sizeId);
    Task<CartResponseDto?> ClearCart(string userId);
}