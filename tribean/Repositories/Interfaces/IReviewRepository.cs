using Tribean.DTOs;
using Tribean.Models;

namespace Tribean.Repositories
{
    public interface IReviewRepository
    {
        Task<bool> HasReviewedAsync(string userId, string productId, string orderId);
        Task<List<Review>> GetReviewsByProductIdAsync(string productId);
        Task AddReviewAsync(Review review);
        Task SaveChangesAsync();
    }
}