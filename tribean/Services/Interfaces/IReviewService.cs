using Tribean.DTOs.Review;

namespace Tribean.Services
{
    public interface IReviewService
    {
        Task<(ReviewResponseDto? review, string? error)> CreateReviewAsync(string userId, CreateReviewDto dto);
        Task<List<ReviewListItemDto>> GetReviewsByProductIdAsync(string productId);
    }
}