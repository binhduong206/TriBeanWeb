using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tribean.DTOs;
using Tribean.Services;

namespace Tribean.Controllers;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
[ApiController]
[Route("api/cart")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "User not authenticated" });

        var cart = await _cartService.GetCart(userId);

        return Ok(cart);
    }

    [HttpPost("items")]
    public async Task<ActionResult> AddCartItem([FromBody] CartItemRequestDto item)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized(new { message = "User not authenticated" });
        if (string.IsNullOrEmpty(item.ProductId)) return BadRequest(new { message = "ProductId is required" });
        if (string.IsNullOrEmpty(item.SizeId)) return BadRequest(new { message = "Sized is required" });

        var cart = await _cartService.AddCartItem(userId, item);
        if (cart == null) return NotFound(new { message = "Cart not found" });

        return Ok(cart);
    }

    [HttpPut("items")]
    public async Task<IActionResult> UpdateCartItem([FromBody] UpdateCartItemDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var cart = await _cartService.UpdateCartItem(userId, dto);
        if (cart == null) return NotFound(new { message = "Item not found" });

        return Ok(cart);
    }

    [HttpDelete("items")]
    public async Task<IActionResult> RemoveCartItem([FromQuery] string productId, [FromQuery] string sizeId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var cart = await _cartService.RemoveCartItem(userId, productId, sizeId);
        if (cart == null) return NotFound(new { message = "Item not found" });

        return Ok(cart);
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var cart = await _cartService.ClearCart(userId);
        if (cart == null) return NotFound(new { message = "Cart not found" });

        return Ok(cart);
    }
}