using HotelOS.Payment.Core.Entities;

namespace HotelOS.Payment.Core.Interfaces;

public interface IPaymentService
{
    Task<PaymentRecord> InitiatePaymentAsync(
        Guid bookingId, Guid guestId, double amount, string currency);
    Task<PaymentRecord> ConfirmPaymentAsync(string stripePaymentIntentId);
    Task<PaymentRecord> FailPaymentAsync(string stripePaymentIntentId, string reason);
    Task<PaymentRecord> RefundPaymentAsync(Guid bookingId);
    Task<PaymentRecord?> GetByBookingIdAsync(Guid bookingId);
}