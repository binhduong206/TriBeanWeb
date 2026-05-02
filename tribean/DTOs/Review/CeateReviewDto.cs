namespace Tribean.DTOs.Review
{
    public class CreateReviewDto
    {
        public string ProductId { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty; // Để verify user đã mua sản phẩm này
        public int Rating { get; set; } // 1-5
        public string? Comment { get; set; }
    }
}