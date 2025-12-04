using Domain.Dtos.Users;
using Domain.Services;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserAppService _userAppService;

        public UserController(IUserAppService userAppService)
        {
            _userAppService = userAppService;
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> Get(long id)
        {
            var u = await _userAppService.GetByIdAsync(id);
            if (u == null) return NotFound();
            return Ok(u);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserRequestDto req)
        {
            var id = await _userAppService.CreateAsync(req.UserName, req.Password, req.Email);
            return CreatedAtAction(nameof(Get), new { id }, new { id });
        }
    }

   
}
