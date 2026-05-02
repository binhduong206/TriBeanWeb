using Tribean.Models;

namespace Tribean.Repositories;

public interface ICartRepository
{
    Task<Cart?> GetCartWithItems(string userId);
    Task<CartItem?> GetCartItemAsync(string cartId, string productId, string sizeId);
    Task AddCartItemsAsync(CartItem item);
    Task RemoveCartItemAsync(CartItem item);
    Task ClearCartAsync(string cartId);
    Task SaveChangesAsync();
    Task<Cart> CreateCartAsync(Cart cart);
}