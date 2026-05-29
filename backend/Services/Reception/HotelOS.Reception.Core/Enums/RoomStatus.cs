namespace HotelOS.Reception.Core.Enums;

public enum RoomStatus
{
    Available,
    Reserved,   // room is claimed by a PendingPayment booking
    OOS,
    Cleaning,
    Active,
    Archived
}