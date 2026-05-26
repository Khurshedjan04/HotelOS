using HotelOS.Reception.Core.Entities;
using HotelOS.Reception.Core.Enums;

namespace HotelOS.Reception.Core.Interfaces;

public interface IBookingRepository
{
    Task<Booking?> GetByIdAsync(Guid id);
    Task<IEnumerable<Booking>> GetByGuestIdAsync(Guid guestId);
    Task<IEnumerable<Booking>> GetByRoomIdAsync(Guid roomId);
    Task<IEnumerable<Booking>> GetExpiredPendingAsync();
    Task AddAsync(Booking booking);
    Task UpdateAsync(Booking booking);
}