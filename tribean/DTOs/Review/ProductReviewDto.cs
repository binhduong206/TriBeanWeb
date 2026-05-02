namespace Tribean.DTOs.Review
{
    public class ReviewListItemDto
    {
        public string ReviewId { get; set; }
        public string UserName { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}