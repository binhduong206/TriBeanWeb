namespace Tribean.DTOs.Order
{
    public class CreateOrderDto
    {
        public string ReceiverName { get; set; } = string.Empty;
        public string ReceiverAddress { get; set; } = string.Empty;
        public string ReceiverPhoneNumber { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = "COD"; // "COD" hoặc "Online"
    }
}