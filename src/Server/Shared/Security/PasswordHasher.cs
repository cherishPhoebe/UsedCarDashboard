using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System.Security.Cryptography;

namespace Shared.Security
{
    public interface IPasswordHasher
    {
        string GenerateSalt();
        string HashPassword(string password, string salt);
        bool Verify(string password, string salt, string hash);
    }

    public class Pbkdf2PasswordHasher : IPasswordHasher
    {
        public string GenerateSalt()
        {
            byte[] salt = new byte[16];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(salt);
            return Convert.ToBase64String(salt);
        }

        public string HashPassword(string password, string salt)
        {
            var saltBytes = Convert.FromBase64String(salt);
            var derived = KeyDerivation.Pbkdf2(
                password: password,
                salt: saltBytes,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 100_000,
                numBytesRequested: 32
            );
            return Convert.ToBase64String(derived);
        }

        public bool Verify(string password, string salt, string hash)
        {
            var h = HashPassword(password, salt);
            return h == hash;
        }
    }
}
