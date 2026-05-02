using Tribean.DTOs.Order;
using Tribean.Helpers;
using Tribean.Models;
using Tribean.Models.Enums;
using Tribean.Repositories;

namespace Tribean.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepo;
        private readonly ICartRepository _cartRepo;
        private const string BaseUrl = "http://localhost:5262";

        public OrderService(IOrderRepository orderRepo, ICartRepository cartRepo)
        {
            _orderRepo = orderRepo;
            _cartRepo = cartRepo;
        }

        public async Task<OrderResponseDto?> CreateOrderAsync(string userId, CreateOrderDto dto)
        {
            // Lấy cart hiện tại
            var cart = await _cartRepo.GetCartWithItems(userId);
            if (cart == null || !cart.CartItems.Any()) return null;

            // Tính tổng tiền
            var totalPrice = cart.CartItems.Sum(ci =>
            {
                var productPrice = ci.Product!.Price * (1 - ci.Product.Discount / 100m);
                var sizePrice = ci.Size?.Price ?? 0;
                return (productPrice + sizePrice) * ci.Quantity;
            });

            // Tạo order
            var order = new Order
            {
                UserId = userId,
                TotalPrice = totalPrice,
                ReceiverName = dto.ReceiverName,
                ReceiverAddress = dto.ReceiverAddress,
                ReceiverPhoneNumber = dto.ReceiverPhoneNumber,
                Status = OrderStatus.Pending,
                PaymentStatus = dto.PaymentMethod == "Online"
                    ? PaymentStatus.Unpaid
                    : PaymentStatus.Unpaid,
                OrderDetails = cart.CartItems.Select(ci =>
                {
                    var productPrice = ci.Product!.Price * (1 - ci.Product.Discount / 100m);
                    var sizePrice = ci.Size?.Price ?? 0;
                    var unitPrice = productPrice + sizePrice;

                    return new OrderDetail
                    {
                        ProductId = ci.ProductId,
                        SizeId = ci.SizeId,
                        Quantity = ci.Quantity,
                        UnitPrice = unitPrice
                    };
                }).ToList()
            };

            await _orderRepo.CreateOrderAsync(order);
            await _orderRepo.SaveChangesAsync();

            // Xóa cart sau khi order
            await _cartRepo.ClearCartAsync(cart.Id);
            await _cartRepo.SaveChangesAsync();

            return MapToDto(order);
        }

        public async Task<OrderResponseDto?> GetOrderAsync(string orderId, string userId)
        {
            var order = await _orderRepo.GetOrderByIdAsync(orderId, userId);
            return order == null ? null : MapToDto(order);
        }

        public async Task<OrdersPagedResponseDto> GetOrdersAsync(string userId, QueryObject query)
        {
            var (orders, totalCount) = await _orderRepo.GetOrdersByUserIdAsync(userId, query);

            return new OrdersPagedResponseDto
            {
                Orders = orders.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling((double)totalCount / query.PageSizeAll),
                CurrentPage = query.PageNumber,
                PageSize = query.PageSizeAll
            };
        }

        private OrderResponseDto MapToDto(Order order)
        {
            return new OrderResponseDto
            {
                OrderId = order.Id,
                OrderDate = order.OrderDate,
                TotalPrice = order.TotalPrice,
                Status = order.Status.ToString(),
                PaymentStatus = order.PaymentStatus.ToString(),
                ReceiverName = order.ReceiverName ?? "",
                ReceiverAddress = order.ReceiverAddress ?? "",
                ReceiverPhoneNumber = order.ReceiverPhoneNumber ?? "",
                Items = order.OrderDetails.Select(od => new OrderDetailResponseDto
                {
                    ProductId = od.ProductId,
                    ProductName = od.Product?.ProductName ?? "",
                    Image = BaseUrl + (od.Product?.MainImgUrl ?? ""),
                    SizeName = od.Size?.SizeName ?? "",
                    Quantity = od.Quantity,
                    UnitPrice = od.UnitPrice,
                    Total = od.UnitPrice * od.Quantity
                }).ToList()
            };
        }

        public async Task<(OrderResponseDto? order, List<string> productIds)> ConfirmDeliveredAsync(string orderId, string userId)
        {
            var order = await _orderRepo.GetOrderByIdAsync(orderId, userId);
            if (order == null) return (null, new());

            // Chỉ cho confirm khi đang Shipping
            if (order.Status != OrderStatus.Shipping)
                return (null, new());

            order.Status = OrderStatus.Delivered;
            order.PaymentStatus = PaymentStatus.Paid;
            await _orderRepo.SaveChangesAsync();

            // Trả về danh sách productIds để frontend biết mời review sản phẩm nào
            var productIds = order.OrderDetails.Select(od => od.ProductId).ToList();

            return (MapToDto(order), productIds);
        }

        public async Task<OrderResponseDto?> CancelOrderAsync(string orderId, string userId)
        {
            var order = await _orderRepo.GetOrderByIdAsync(orderId, userId);
            if (order == null) return null;

            if (order.Status != OrderStatus.Pending)
                return null;

            order.Status = OrderStatus.Cancelled;
            await _orderRepo.SaveChangesAsync();
            return MapToDto(order);
        }
    }

}