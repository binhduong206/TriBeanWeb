using Tribean.DTOs;
using Tribean.Mappers;
using Tribean.Models;
using Tribean.Repositories;

namespace Tribean.Services;

public class CartService : ICartService
{
    private readonly ICartRepository _repo;

    public CartService(ICartRepository repo)
    {
        _repo = repo;
    }

    public async Task<CartResponseDto?> AddCartItem(string userId, CartItemRequestDto item)
    {
        var cart = await _repo.GetCartWithItems(userId);
        if (cart == null) return null;

        var existingItem = await _repo.GetCartItemAsync(cart.Id, item.ProductId, item.SizeId);

        if (existingItem != null)
        {
            existingItem.Quantity += item.Quantity;
        }
        else
        {
            var newItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = item.ProductId,
                SizeId = item.SizeId,
                Quantity = item.Quantity
            };
            await _repo.AddCartItemsAsync(newItem);
        }
        await _repo.SaveChangesAsync();
        var updateCart = await _repo.GetCartWithItems(userId);
        return CartMapper.ToCartResponse(updateCart!);
    }

    public async Task<CartResponseDto?> ClearCart(string userId)
    {
        var cart = await _repo.GetCartWithItems(userId);
        if (cart == null) return null;

        await _repo.ClearCartAsync(cart.Id);
        await _repo.SaveChangesAsync();

        var updated = await _repo.GetCartWithItems(userId);
        return CartMapper.ToCartResponse(updated!);
    }

    public async Task<CartResponseDto?> GetCart(string userId)
    {
        var cart = await _repo.GetCartWithItems(userId);

        if (cart == null)
        {
            cart = new Cart
            {
                UserId = userId,
                CartItems = new List<CartItem>()
            };
            await _repo.CreateCartAsync(cart);
            await _repo.SaveChangesAsync();
        }

        return CartMapper.ToCartResponse(cart);
    }

    public async Task<CartResponseDto?> RemoveCartItem(string userId, string productId, string sizeId)
    {
        var cart = await _repo.GetCartWithItems(userId);
        if (cart == null) return null;

        var item = await _repo.GetCartItemAsync(cart.Id, productId, sizeId);
        if (item == null) return null;

        await _repo.RemoveCartItemAsync(item);
        await _repo.SaveChangesAsync();

        var updated = await _repo.GetCartWithItems(userId);
        return CartMapper.ToCartResponse(updated!);
    }

    public async Task<CartResponseDto?> UpdateCartItem(string userId, UpdateCartItemDto dto)
    {
        var cart = await _repo.GetCartWithItems(userId);
        if (cart == null) return null;

        var item = await _repo.GetCartItemAsync(cart.Id, dto.ProductId, dto.SizeId);
        if (item == null) return null;

        if (dto.Quantity <= 0)
        {
            // Nếu quantity = 0 thì xóa luôn
            await _repo.RemoveCartItemAsync(item);
        }
        else
        {
            item.Quantity = dto.Quantity;
        }

        await _repo.SaveChangesAsync();
        var updated = await _repo.GetCartWithItems(userId);
        return CartMapper.ToCartResponse(updated!);
    }
}