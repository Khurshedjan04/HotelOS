using HotelOS.Identity.API.DTOs;
using HotelOS.Identity.Core.Entities;
using HotelOS.Identity.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelOS.Identity.API.Controllers;

[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly IIdentityService _identityService;

    public UserController(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    /// <summary>POST api/users/client — guest self-registration</summary>
    [HttpPost("client")]
    public async Task<IActionResult> CreateClient(
        [FromBody] CreateClientRequest request)
    {
        try
        {
            var account = await _identityService.CreateClientAsync(
                request.Email, request.Password,
                request.FirstName, request.LastName, request.Phone);

            return CreatedAtAction(nameof(GetById),
                new { id = account.Id },
                new { account.Id, account.Email, account.Role });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>POST api/users/staff — Manager only</summary>
    [HttpPost("staff")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> CreateStaff(
        [FromBody] CreateStaffRequest request)
    {
        try
        {
            var profile = new StaffProfile
            {
                FirstName             = request.Profile.FirstName,
                LastName              = request.Profile.LastName,
                Phone                 = request.Profile.Phone,
                Department            = request.Profile.Department,
                JobTitle              = request.Profile.JobTitle,
                HireDate              = request.Profile.HireDate,
                EmergencyContactName  = request.Profile.EmergencyContactName,
                EmergencyContactPhone = request.Profile.EmergencyContactPhone,
            };

            var account = await _identityService.CreateStaffAsync(
                request.Email, request.Password, request.Role, profile);

            return CreatedAtAction(nameof(GetById),
                new { id = account.Id },
                new { account.Id, account.Email, account.Role });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>GET api/users/{id}</summary>
    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var profile = await _identityService.GetStaffProfileAsync(id);

        return Ok(new
        {
            AccountId = id,
            Profile   = profile
        });
    }

    /// <summary>DELETE api/users/{id} — Manager only</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        await _identityService.DeactivateAccountAsync(id);
        return NoContent();
    }
}