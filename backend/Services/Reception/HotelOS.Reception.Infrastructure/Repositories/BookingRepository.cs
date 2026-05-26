using HotelOS.Reception.Core.Entities;
using HotelOS.Reception.Core.Enums;
using HotelOS.Reception.Core.Interfaces;
using HotelOS.Reception.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelOS.Reception.Infrastructure.Repositories;

public class BookingRepository : IBookingRepository
{
    private readonly ReceptionDbContext _db;

    public BookingRepository(ReceptionDbContext db) => _db = db;

    public async Task<Booking?> GetByIdAsync(Guid id)
        => await _db.Bookings
            .Include(b => b.Room)
            .FirstOrDefaultAsync(b => b.Id == id);

    public async Task<IEnumerable<Booking>> GetByGuestIdAsync(Guid guestId)
        => await _db.Bookings
            .Include(b => b.Room)
            .Where(b => b.GuestId == guestId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Booking>> GetByRoomIdAsync(Guid roomId)
        => await _db.Bookings
            .Where(b => b.RoomId == roomId)
            .OrderByDescending(b => b.CheckIn)
            .ToListAsync();

    public async Task<IEnumerable<Booking>> GetExpiredPendingAsync()
        => await _db.Bookings
            .Where(b => b.Status == BookingStatus.PendingPayment
                        && b.ExpiresAt < DateTime.UtcNow)
            .ToListAsync();

    public async Task AddAsync(Booking booking)
    {
        await _db.Bookings.AddAsync(booking);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Booking booking)
    {
        _db.Bookings.Update(booking);
        await _db.SaveChangesAsync();
    }
}