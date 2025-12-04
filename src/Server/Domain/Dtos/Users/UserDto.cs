namespace Domain.Dtos.Users
{
    public class UserDto
    {
        public long Id { get; set; }
        public string UserName { get; set; } = null!;
        public string? Email { get; set; }
        public bool IsEnabled { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
