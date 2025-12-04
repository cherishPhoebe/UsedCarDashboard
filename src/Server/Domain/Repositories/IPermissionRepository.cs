using Domain.Entities;
using Shared.Enums;

namespace Domain.Repositories
{
    public interface IPermissionRepository
    {
        Task<Permission?> GetByIdAsync(long id);
        Task<Permission?> GetByNameAsync(string name);
        Task<Permission?> GetByResourceAsync(ResourceType resourceType, string resourceKey, string? action);
        Task<long> AddAsync(Permission p);
        Task UpdateAsync(Permission p);
        Task DeleteAsync(long id);
        Task<IEnumerable<Permission>> GetAllByResourceAsync(ResourceType resourceType, string resourceKey);
    }
}
