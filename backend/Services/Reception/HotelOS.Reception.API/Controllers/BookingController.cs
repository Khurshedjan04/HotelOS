using HotelOS.Reception.API.DTOs;
using HotelOS.Reception.Core.Interfaces;
using HotelOS.Shared.Contracts.Events;
using MassTransit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HotelOS.Reception.API.Controllers;

[ApiController]
[Route("api/bookings")]
public class BookingController : ControllerBase
{
    private readonly IReceptionService _service;
    private readonly IPublishEndpoint  _broker;

    public BookingController(IReceptionService service, IPublishEndpoint broker)
    {
        _service = service;
        _broker  = broker;
    }

    /// <summary>POST api/bookings — Guest creates reservation</summary>
    [HttpPost]
    [Authorize(Roles = "Client")]
    public async Task<IActionResult> Create([FromBody] CreateBookingRequest request)
    {
        try
        {
            var guestId = Guid.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var booking = await _service.CreateReservationAsync(
                guestId, request.RoomId, request.CheckIn, request.CheckOut);

            // publish to broker — Notification Service will push to guest
            await _broker.Publish(new ReservationCreatedEvent(
                booking.Id, booking.GuestId, booking.RoomId,
                booking.CheckIn, booking.CheckOut,
                booking.TotalPrice, booking.ExpiresAt,
                DateTime.UtcNow));

            return CreatedAtAction(nameof(GetById),
                new { id = booking.Id },
                MapToResponse(booking));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>GET api/bookings/{id}</summary>
    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var booking = await _service
                .ConfirmReservationAsync(id); // just fetching
            return Ok(MapToResponse(booking));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    /// <summary>POST api/bookings/{id}/confirm — called by Payment Service
    /// after payment.confirmed event</summary>
    [HttpPost("{id:guid}/confirm")]
    [Authorize]
    public async Task<IActionResult> Confirm(Guid id)
    {
        try
        {
            var booking = await _service.ConfirmReservationAsync(id);
            return Ok(MapToResponse(booking));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>POST api/bookings/{id}/cancel</summary>
    [HttpPost("{id:guid}/cancel")]
    [Authorize]
    public async Task<IActionResult> Cancel(Guid id)
    {
        try
        {
            var booking = await _service.CancelReservationAsync(id);
            return Ok(MapToResponse(booking));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>POST api/bookings/{id}/checkin — Receptionist</summary>
    [HttpPost("{id:guid}/checkin")]
    [Authorize(Roles = "Receptionist,Manager")]
    public async Task<IActionResult> CheckIn(Guid id)
    {
        try
        {
            var booking = await _service.CheckInAsync(id);
            return Ok(MapToResponse(booking));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>POST api/bookings/{id}/checkout — Receptionist</summary>
    [HttpPost("{id:guid}/checkout")]
    [Authorize(Roles = "Receptionist,Manager")]
    public async Task<IActionResult> CheckOut(Guid id)
    {
        try
        {
            var booking = await _service.CheckOutAsync(id);

            // publish room.vacated — Housekeeping subscribes to this
            await _broker.Publish(new RoomVacatedEvent(
                booking.RoomId, string.Empty,
                booking.Id, booking.GuestId,
                DateTime.UtcNow));

            return Ok(MapToResponse(booking));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>POST api/bookings/walkin — Receptionist walk-in</summary>
    [HttpPost("walkin")]
    [Authorize(Roles = "Receptionist,Manager")]
    public async Task<IActionResult> WalkIn([FromBody] WalkInBookingRequest request)
    {
        try
        {
            var booking = await _service.WalkInReservationAsync(
                request.GuestId, request.RoomId,
                request.CheckIn, request.CheckOut);

            await _broker.Publish(new ReservationCreatedEvent(
                booking.Id, booking.GuestId, booking.RoomId,
                booking.CheckIn, booking.CheckOut,
                booking.TotalPrice, booking.ExpiresAt,
                DateTime.UtcNow));

            return CreatedAtAction(nameof(GetById),
                new { id = booking.Id },
                MapToResponse(booking));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>PATCH api/bookings/{id}/reassign — Receptionist</summary>
    [HttpPatch("{id:guid}/reassign")]
    [Authorize(Roles = "Receptionist,Manager")]
    public async Task<IActionResult> Reassign(
        Guid id, [FromBody] ReassignRoomRequest request)
    {
        try
        {
            await _service.ReassignRoomAsync(id, request.NewRoomId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // ── Helper ────────────────────────────────────────────────
    private static BookingResponse MapToResponse(
        Core.Entities.Booking b) => new(
        b.Id, b.GuestId, b.RoomId,
        b.Room?.RoomNumber ?? string.Empty,
        b.CheckIn, b.CheckOut, b.EffectiveCheckout,
        b.Status.ToString(), b.TotalPrice,
        b.ExpiresAt, b.CreatedAt);
}