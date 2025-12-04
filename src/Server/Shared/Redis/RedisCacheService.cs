using StackExchange.Redis;
using System.Text.Json;

namespace Shared.Redis
{
    public interface ICacheService
    {
        Task SetAsync<T>(string key, T value, TimeSpan? expiry = null);
        Task<T?> GetAsync<T>(string key);
        Task RemoveAsync(string key);
    }

    public class RedisCacheService : ICacheService, IDisposable
    {
        private readonly IConnectionMultiplexer _conn;
        private readonly IDatabase _db;
        public RedisCacheService(IConnectionMultiplexer conn)
        {
            _conn = conn;
            _db = _conn.GetDatabase();
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
        {
            var json = JsonSerializer.Serialize(value);
            await _db.StringSetAsync(key, json, expiry);
        }

        public async Task<T?> GetAsync<T>(string key)
        {
            var v = await _db.StringGetAsync(key);
            if (v.IsNullOrEmpty) return default;
            return JsonSerializer.Deserialize<T>(v!);
        }

        public async Task RemoveAsync(string key) => await _db.KeyDeleteAsync(key);

        public void Dispose() => _conn?.Dispose();
    }
}