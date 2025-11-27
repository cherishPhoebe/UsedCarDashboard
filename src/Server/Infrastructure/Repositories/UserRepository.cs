using Domain.Interfaces.Repositories;
using Domain.Models;
using Infrastructure.Data;
using SqlSugar;

namespace Infrastructure.Repositories
{

    public class UserRepository : IUserRepository
    {
        private readonly ISqlSugarClient _db;

        public UserRepository(AppDbContext context)
        {
            _db = context.Database;
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await _db.Queryable<User>()
                .FirstAsync(u => u.Username == username && u.IsActive);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _db.Queryable<User>()
                .FirstAsync(u => u.Email == email && u.IsActive);
        }

        public async Task<User> CreateUserAsync(User user)
        {
            return await _db.Insertable(user).ExecuteReturnEntityAsync();
        }

        public async Task<bool> UserExistsAsync(string username)
        {
            return await _db.Queryable<User>()
                .AnyAsync(u => u.Username == username);
        }

        public async Task UpdateUserAsync(User user)
        {
            await _db.Updateable(user).ExecuteCommandAsync();
        }
    }

    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private IUserRepository? _userRepository;

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
        }

        public IUserRepository Users => _userRepository ??= new UserRepository(_context);

        public async Task<int> SaveChangesAsync()
        {
            return await _context.Database.SaveQueuesAsync();
        }

        public async Task<bool> CommitAsync()
        {
            try
            {
                await SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public void Dispose()
        {
            _context.Database.Dispose();
        }
    }
}
