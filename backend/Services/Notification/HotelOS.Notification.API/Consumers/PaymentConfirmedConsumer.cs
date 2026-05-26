using HotelOS.Notification.API.Hubs;
using HotelOS.Shared.Contracts.Events;
using MassTransit;
using Microsoft.AspNetCore.SignalR;

namespace HotelOS.Notification.API.Consumers;

public class PaymentConfirmedConsumer : IConsumer<PaymentConfirmedEvent>
{
    private readonly IHubContext<HotelHub> _hub;
    private readonly ILogger<PaymentConfirmedConsumer> _logger;

    public PaymentConfirmedConsumer(
        IHubContext<HotelHub> hub,
        ILogger<PaymentConfirmedConsumer> logger)
    {
        _hub    = hub;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<PaymentConfirmedEvent> context)
    {
        var e = context.Message;
        _logger.LogInformation(
            "Payment confirmed: booking {BookingId}", e.BookingId);

        // push booking confirmed to the guest
        // (we don't have GuestId here — Reception Service
        //  should also subscribe and confirm the booking)
        await _hub.Clients.Group("rooms").SendAsync("PaymentConfirmed", new
        {
            e.BookingId,
            e.PaymentId,
            e.OccurredAt
        });
    }
}