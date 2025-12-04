using Shared.Enums;

namespace Domain.Entities
{
    public class Permission
    {
        public long Id { get; set; }
        public string Name { get; set; } = null!;
        public string? DisplayName { get; set; }
        public ResourceType ResourceType { get; set; }
        public string? ResourceKey { get; set; }
        public string? Action { get; set; }
        public string? Category { get; set; }
        public bool IsEnabled { get; set; } = true;
        public DateTime CreatedAt { get; set; }
    }
}
