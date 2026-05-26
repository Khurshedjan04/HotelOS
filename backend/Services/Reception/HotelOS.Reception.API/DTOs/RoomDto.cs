using HotelOS.Reception.Core.Enums;

namespace HotelOS.Reception.API.DTOs;

public record CreateRoomRequest(
    string    RoomNumber,
    int       Floor,
    RoomStyle Style,
    double    PricePerNight,
    int       Capacity,
    bool      IsSmokingAllowed,
    string    Description);

public record RoomResponse(
    Guid      Id,
    string    RoomNumber,
    int       Floor,
    string    Style,
    string    Status,
    double    PricePerNight,
    int       Capacity,
    bool      IsSmokingAllowed,
    string    Description,
    DateTime  NextAvailableFrom);