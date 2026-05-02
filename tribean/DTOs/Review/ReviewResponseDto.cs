namespace Tribean.DTOs.Review
{
    public class ReviewResponseDto
    {
        public string ReviewId { get; set; }
        public string ProductId { get; set; }
        public string ProductName { get; set; }
        public string Image { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}