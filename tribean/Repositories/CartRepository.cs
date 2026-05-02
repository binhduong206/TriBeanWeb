using Microsoft.EntityFrameworkCore;
using Tribean.Data;
using Tribean.Models;

namespace Tribean.Repositories;

public class CartRepository : ICartRepository
{
    private readonly ApplicationDbContext _context;

    public CartRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddCartItemsAsync(CartItem item)
    {
        await _context.CartItems.AddAsync(item);
    }

    public async Task ClearCartAsync(string cartId)
    {
        var items = await _context.CartItems
            .Where(ci => ci.CartId == cartId)
            .ToListAsync();
        _context.CartItems.RemoveRange(items);
    }

    public async Task<Cart> CreateCartAsync(Cart cart)
    {
        await _context.Carts.AddAsync(cart);
        return cart;
    }

    public async Task<CartItem?> GetCartItemAsync(string cartId, string productId, string sizeId)
    {
        return await _context.CartItems.FirstOrDefaultAsync(ci => ci.CartId == cartId && ci.ProductId == productId && ci.SizeId == sizeId);
    }

    public async Task<Cart?> GetCartWithItems(string userId)
    {
        return await _context.Carts
            .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
                    .ThenInclude(p => p.Category)
            .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Size)
            .FirstOrDefaultAsync(c => c.UserId == userId);
    }

    public async Task RemoveCartItemAsync(CartItem item)
    {
        _context.CartItems.Remove(item);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}