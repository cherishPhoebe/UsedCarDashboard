using Application.Security;
using Domain.Repositories;
using Domain.Services;
using Microsoft.AspNetCore.Mvc;
using Shared.Enums;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PermissionsController : ControllerBase
    {
        private readonly IRoleAppService _roleApp;
        private readonly IPermissionAppService _permApp;
        private readonly IUserRepository _userRepo;
        private readonly IPermissionChecker _checker;

        public PermissionsController(IRoleAppService roleApp, IPermissionAppService permApp, IUserRepository userRepo, IPermissionChecker checker)
        {
            _roleApp = roleApp;
            _permApp = permApp;
            _userRepo = userRepo;
            _checker = checker;
        }

        [HttpPost("role/{roleId:long}/assign/{permissionId:long}")]
        public async Task<IActionResult> AssignRolePermission(long roleId, long permissionId)
        {
            await _roleApp.AssignPermissionToRoleAsync(roleId, permissionId);
            return Ok();
        }

        [HttpPost("user/{userId:long}/assign/{permissionId:long}")]
        public async Task<IActionResult> AssignUserPermission(long userId, long permissionId, [FromQuery] byte type = 1)
        {
            await _userRepo.AssignPermissionAsync(userId, permissionId, type);
            // invalidate cache for the user via roleApp or permissionChecker if needed
            return Ok();
        }

        [HttpGet("check")]
        public async Task<IActionResult> Check([FromQuery] long userId, [FromQuery] ResourceType resourceType, [FromQuery] string resourceKey, [FromQuery] string? action)
        {
            var ok = await _checker.IsGrantedAsync(userId, resourceType, resourceKey, action);
            return Ok(new { granted = ok });
        }
    }
}
