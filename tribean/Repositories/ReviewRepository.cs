using Microsoft.EntityFrameworkCore;
using Tribean.Data;
using Tribean.Models;

namespace Tribean.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly ApplicationDbContext _db;

        public ReviewRepository(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<bool> HasReviewedAsync(string userId, string productId, string orderId)
        {
            // Kiểm tra user đã review product này trong order này chưa
            var order = await _db.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

            if (order == null) return true; // Không có order → coi như không hợp lệ

            // Kiểm tra product có trong order không
            var hasProduct = order.OrderDetails.Any(od => od.ProductId == productId);
            if (!hasProduct) return true; // Product không trong order → không cho review

            // Kiểm tra đã review chưa
            return await _db.Reviews
                .AnyAsync(r => r.UserId == userId && r.ProductId == productId);
        }

        public async Task<List<Review>> GetReviewsByProductIdAsync(string productId)
        {
            return await _db.Reviews
                .Include(r => r.User)
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task AddReviewAsync(Review review)
        {
            await _db.Reviews.AddAsync(review);
        }

        public async Task SaveChangesAsync()
        {
            await _db.SaveChangesAsync();
        }
    }
}