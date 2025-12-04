using Shared.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Services
{
    public interface IPermissionAppService
    {
        Task<long> CreatePermissionAsync(string name, ResourceType resourceType, string resourceKey, string? action, string? displayName);
    }
}
