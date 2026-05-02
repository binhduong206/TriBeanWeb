using Tribean.DTOs.Order;
using Tribean.Helpers;

namespace Tribean.Services
{
    public interface IOrderService
    {
        Task<OrderResponseDto?> CreateOrderAsync(string userId, CreateOrderDto dto);
        Task<OrderResponseDto?> GetOrderAsync(string orderId, string userId);
        Task<OrdersPagedResponseDto> GetOrdersAsync(string userId, QueryObject query);
        Task<(OrderResponseDto? order, List<string> productIds)> ConfirmDeliveredAsync(string orderId, string userId);
        Task<OrderResponseDto?> CancelOrderAsync(string orderId, string userId);
    }
}