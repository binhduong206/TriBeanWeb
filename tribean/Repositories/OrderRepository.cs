using Microsoft.EntityFrameworkCore;
using Tribean.Data;
using Tribean.Helpers;
using Tribean.Models;
using Tribean.Models.Enums;

namespace Tribean.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDbContext _db;

        public OrderRepository(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<Order> CreateOrderAsync(Order order)
        {
            _db.Orders.Add(order);
            return order;
        }

        public async Task<Order?> GetOrderByIdAsync(string orderId, string userId)
        {
            return await _db.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Size)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);
        }

        public async Task<(List<Order> orders, int totalCount)> GetOrdersByUserIdAsync(string userId, QueryObject query)
        {
            var q = _db.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Size)
                .Where(o => o.UserId == userId)
                .AsQueryable();

            // Filter theo status
            if (!string.IsNullOrEmpty(query.Symbol) && query.Symbol != "All")
            {
                if (Enum.TryParse<OrderStatus>(query.Symbol, out var status))
                    q = q.Where(o => o.Status == status);
            }

            var totalCount = await q.CountAsync();

            var orders = await q
                .OrderByDescending(o => o.OrderDate)
                .Skip((query.PageNumber - 1) * query.PageSizeAll)
                .Take(query.PageSizeAll)
                .ToListAsync();

            return (orders, totalCount);
        }

        public async Task SaveChangesAsync()
        {
            await _db.SaveChangesAsync();
        }
    }
}