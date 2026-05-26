using HotelOS.Notification.API.Hubs;
using HotelOS.Shared.Contracts.Events;
using MassTransit;
using Microsoft.AspNetCore.SignalR;

namespace HotelOS.Notification.API.Consumers;

public class ReservationCreatedConsumer
    : IConsumer<ReservationCreatedEvent>
{
    private readonly IHubContext<HotelHub> _hub;
    private readonly ILogger<ReservationCreatedConsumer> _logger;

    public ReservationCreatedConsumer(
        IHubContext<HotelHub> hub,
        ILogger<ReservationCreatedConsumer> logger)
    {
        _hub    = hub;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ReservationCreatedEvent> context)
    {
        var e = context.Message;
        _logger.LogInformation(
            "Reservation created: {BookingId} for guest {GuestId}", 
            e.BookingId, e.GuestId);

        // push only to the specific guest's personal channel
        await _hub.Clients
            .Group($"user:{e.GuestId}")
            .SendAsync("ReservationCreated", new
            {
                e.BookingId,
                e.RoomId,
                e.CheckIn,
                e.CheckOut,
                e.TotalPrice,
                e.ExpiresAt,
                e.OccurredAt
            });

        // also push to "rooms" channel so searching guests
        // see this room disappear from results
        await _hub.Clients.Group("rooms").SendAsync("RoomStatusUpdated", new
        {
            e.RoomId,
            RoomNumber = string.Empty,
            NewStatus  = "Reserved",
            e.OccurredAt
        });
    }
}