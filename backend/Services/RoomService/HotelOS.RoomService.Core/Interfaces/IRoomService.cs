using HotelOS.RoomService.Core.Entities;
using HotelOS.RoomService.Core.Enums;

namespace HotelOS.RoomService.Core.Interfaces;

public interface IRoomServiceService
{
    Task<Order> CreateOrderAsync(
        Guid bookingId, Guid roomId, Guid guestId,
        List<(Guid menuItemId, int quantity)> items);
    Task<Order> UpdateOrderStatusAsync(Guid orderId, OrderStatus status);
    Task<IEnumerable<Order>> GetActiveOrdersAsync();
    Task<Order?> GetOrderByIdAsync(Guid id);
    Task<IEnumerable<MenuItem>> GetMenuAsync();
    Task<MenuItem> AddMenuItemAsync(MenuItem item);
    Task<MenuItem> ToggleMenuItemAsync(Guid id);
}