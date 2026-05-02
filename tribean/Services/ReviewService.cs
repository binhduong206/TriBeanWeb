using Tribean.DTOs.Review;
using Tribean.Models;
using Tribean.Models.Enums;
using Tribean.Repositories;

namespace Tribean.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepo;
        private readonly IOrderRepository _orderRepo;
        private const string BaseUrl = "http://localhost:5262";

        public ReviewService(IReviewRepository reviewRepo, IOrderRepository orderRepo)
        {
            _reviewRepo = reviewRepo;
            _orderRepo = orderRepo;
        }

        public async Task<(ReviewResponseDto? review, string? error)> CreateReviewAsync(string userId, CreateReviewDto dto)
        {
            // Validate rating
            if (dto.Rating < 1 || dto.Rating > 5)
                return (null, "Rating must be between 1 and 5");

            // Kiểm tra order tồn tại, thuộc user, đã Delivered
            var order = await _orderRepo.GetOrderByIdAsync(dto.OrderId, userId);
            if (order == null)
                return (null, "Order not found");

            if (order.Status != OrderStatus.Delivered)
                return (null, "You can only review after order is delivered");

            // Kiểm tra đã review chưa hoặc product không trong order
            var alreadyReviewed = await _reviewRepo.HasReviewedAsync(userId, dto.ProductId, dto.OrderId);
            if (alreadyReviewed)
                return (null, "You have already reviewed this product");

            var review = new Review
            {
                UserId = userId,
                ProductId = dto.ProductId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            await _reviewRepo.AddReviewAsync(review);
            await _reviewRepo.SaveChangesAsync();

            // Load product info để trả về
            var product = order.OrderDetails
                .FirstOrDefault(od => od.ProductId == dto.ProductId)?.Product;

            return (new ReviewResponseDto
            {
                ReviewId = review.Id,
                ProductId = review.ProductId,
                ProductName = product?.ProductName ?? "",
                Image = BaseUrl + (product?.MainImgUrl ?? ""),
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt
            }, null);
        }

        public async Task<List<ReviewListItemDto>> GetReviewsByProductIdAsync(string productId)
        {
            var reviews = await _reviewRepo.GetReviewsByProductIdAsync(productId);

            return reviews.Select(r => new ReviewListItemDto
            {
                ReviewId = r.Id,
                UserName = r.User != null
                    ? $"{r.User.FirstName} {r.User.LastName}".Trim()
                    : "Anonymous",
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            }).ToList();
        }
    }
}