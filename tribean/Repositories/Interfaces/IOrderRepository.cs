using Tribean.Helpers;
using Tribean.Models;

namespace Tribean.Repositories
{
    public interface IOrderRepository
    {
        Task<Order> CreateOrderAsync(Order order);
        Task<Order?> GetOrderByIdAsync(string orderId, string userId);
        Task<(List<Order> orders, int totalCount)> GetOrdersByUserIdAsync(string userId, QueryObject query);
        Task SaveChangesAsync();
    }
}