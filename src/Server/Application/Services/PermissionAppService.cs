using Domain.Entities;
using Domain.Repositories;
using Domain.Services;
using Shared.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class PermissionAppService: IPermissionAppService
    {
        private readonly IPermissionRepository _permRepo;
        public PermissionAppService(IPermissionRepository permRepo) => _permRepo = permRepo;

        public async Task<long> CreatePermissionAsync(string name, ResourceType resourceType, string resourceKey, string? action, string? displayName)
        {
            var exists = await _permRepo.GetByNameAsync(name);
            if (exists != null) throw new InvalidOperationException("Permission exists");
            var p = new Permission { Name = name, DisplayName = displayName, ResourceType = resourceType, ResourceKey = resourceKey, Action = action, IsEnabled = true, CreatedAt = DateTime.UtcNow };
            return await _permRepo.AddAsync(p);
        }
    }
}
