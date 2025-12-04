using Domain.Dtos.Auth;
using Domain.Services;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;
        public AuthController(IAuthService auth) => _auth = auth;

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto req)
        {
            var (access, refresh) = await _auth.LoginAsync(req.UserName, req.Password);
            return Ok(new { accessToken = access, refreshToken = refresh });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshRequestDto req)
        {
            var (access, refresh) = await _auth.RefreshAsync(req.RefreshToken);
            return Ok(new { accessToken = access, refreshToken = refresh });
        }
    }
}