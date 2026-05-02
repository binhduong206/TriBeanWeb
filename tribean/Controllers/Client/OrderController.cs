using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tribean.DTOs.Order;
using Tribean.Helpers;
using Tribean.Services;

namespace Tribean.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ApiController]
    [Route("api/orders")]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var order = await _orderService.CreateOrderAsync(userId, dto);
            if (order == null)
                return BadRequest(new { message = "Cart is empty or not found" });

            return Ok(order);
        }

        [HttpGet]
        public async Task<IActionResult> GetOrders([FromQuery] QueryObject queryObject)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var orders = await _orderService.GetOrdersAsync(userId, queryObject);
            return Ok(orders);
        }

        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetOrder(string orderId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var order = await _orderService.GetOrderAsync(orderId, userId);
            if (order == null) return NotFound();

            return Ok(order);
        }

        [HttpPut("{orderId}/confirm-delivered")]
        public async Task<IActionResult> ConfirmDelivered(string orderId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var (order, productIds) = await _orderService.ConfirmDeliveredAsync(orderId, userId);
            if (order == null)
                return BadRequest(new { message = "Cannot confirm. Order must be in Shipping status." });

            // Trả về order + productIds để frontend biết mời review sản phẩm nào
            return Ok(new { order, productIds });
        }

        [HttpPut("{orderId}/cancel")]
        public async Task<IActionResult> CancelOrder(string orderId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var order = await _orderService.CancelOrderAsync(orderId, userId);
            if (order == null)
                return BadRequest(new { message = "Cannot cancel. Order must be in Pending status." });

            return Ok(order);
        }
    }
}