using HotelOS.RoomService.Core.Entities;
using HotelOS.RoomService.Core.Enums;
using HotelOS.RoomService.Core.Interfaces;

namespace HotelOS.RoomService.Core.Services;

public class RoomServiceService : IRoomServiceService
{
    private readonly IOrderRepository    _orderRepo;
    private readonly IMenuItemRepository _menuRepo;

    public RoomServiceService(
        IOrderRepository    orderRepo,
        IMenuItemRepository menuRepo)
    {
        _orderRepo = orderRepo;
        _menuRepo  = menuRepo;
    }

    public async Task<Order> CreateOrderAsync(
        Guid bookingId, Guid roomId, Guid guestId,
        List<(Guid menuItemId, int quantity)> items)
    {
        if (items.Count == 0)
            throw new ArgumentException("Order must have at least one item.");

        var orderItems = new List<OrderItem>();
        double total   = 0;

        foreach (var (menuItemId, quantity) in items)
        {
            var menuItem = await _menuRepo.GetByIdAsync(menuItemId)
                ?? throw new KeyNotFoundException(
                    $"Menu item {menuItemId} not found.");

            if (!menuItem.IsAvailable)
                throw new InvalidOperationException(
                    $"Menu item '{menuItem.Name}' is not available.");

            var orderItem = new OrderItem
            {
                Id         = Guid.NewGuid(),
                MenuItemId = menuItemId,
                Quantity   = quantity,
                UnitPrice  = menuItem.Price
            };

            orderItems.Add(orderItem);
            total += orderItem.GetSubtotal();
        }

        var order = new Order
        {
            Id         = Guid.NewGuid(),
            BookingId  = bookingId,
            RoomId     = roomId,
            GuestId    = guestId,
            Status     = OrderStatus.Received,
            TotalPrice = total,
            CreatedAt  = DateTime.UtcNow,
            Items      = orderItems
        };

        foreach (var item in orderItems)
            item.OrderId = order.Id;

        await _orderRepo.AddAsync(order);
        return order;
    }

    public async Task<Order> UpdateOrderStatusAsync(Guid orderId, OrderStatus status)
    {
        var order = await _orderRepo.GetByIdAsync(orderId)
            ?? throw new KeyNotFoundException("Order not found.");

        order.UpdateStatus(status);
        await _orderRepo.UpdateAsync(order);
        return order;
    }

    public async Task<IEnumerable<Order>> GetActiveOrdersAsync()
        => await _orderRepo.GetActiveAsync();

    public async Task<Order?> GetOrderByIdAsync(Guid id)
        => await _orderRepo.GetByIdAsync(id);

    public async Task<IEnumerable<MenuItem>> GetMenuAsync()
        => await _menuRepo.GetAvailableAsync();

    public async Task<MenuItem> AddMenuItemAsync(MenuItem item)
    {
        item.Id = Guid.NewGuid();
        await _menuRepo.AddAsync(item);
        return item;
    }

    public async Task<MenuItem> ToggleMenuItemAsync(Guid id)
    {
        var item = await _menuRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Menu item not found.");

        item.Toggle();
        await _menuRepo.UpdateAsync(item);
        return item;
    }
}