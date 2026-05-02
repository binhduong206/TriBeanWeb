namespace Tribean.DTOs.Order
{
    public class OrdersPagedResponseDto
    {
        public List<OrderResponseDto> Orders { get; set; } = new();
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
    }
}