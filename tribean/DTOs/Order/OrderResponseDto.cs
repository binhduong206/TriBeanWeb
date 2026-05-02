namespace Tribean.DTOs.Order
{
    public class OrderResponseDto
    {
        public string OrderId { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; }
        public string PaymentStatus { get; set; }
        public string ReceiverName { get; set; }
        public string ReceiverAddress { get; set; }
        public string ReceiverPhoneNumber { get; set; }
        public List<OrderDetailResponseDto> Items { get; set; } = new();
    }

    public class OrderDetailResponseDto
    {
        public string ProductId { get; set; }
        public string ProductName { get; set; }
        public string Image { get; set; }
        public string SizeName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Total { get; set; }
    }
}