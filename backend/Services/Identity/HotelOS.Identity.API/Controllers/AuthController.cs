using HotelOS.Identity.API.DTOs;
using HotelOS.Identity.API.Services;
using HotelOS.Identity.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HotelOS.Identity.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IIdentityService _identityService;
    private readonly JwtTokenService  _jwtService;

    public AuthController(
        IIdentityService identityService,
        JwtTokenService  jwtService)
    {
        _identityService = identityService;
        _jwtService      = jwtService;
    }

    /// <summary>POST api/auth/login</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var account = await _identityService.LoginAsync(
                request.Email, request.Password);

            var token = _jwtService.GenerateToken(account);

            return Ok(new LoginResponse(
                Id:        account.Id,
                Email:     account.Email,
                Role:      account.Role.ToString(),
                Token:     token,
                ExpiresAt: DateTime.UtcNow.AddMinutes(60)));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }
}