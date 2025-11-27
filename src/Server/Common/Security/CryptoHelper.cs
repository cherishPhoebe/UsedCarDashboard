using System.Security.Cryptography;
using System.Text;

namespace Common.Security
{

    public static class CryptoHelper
    {
        /// <summary>
        /// 使用SHA256加密字符串
        /// </summary>
        public static string Sha256Hash(string input)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(input);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        /// <summary>
        /// 生成随机验证码
        /// </summary>
        public static string GenerateRandomCode(int length = 4)
        {
            var random = new Random();
            var code = new StringBuilder();

            for (int i = 0; i < length; i++)
            {
                code.Append(random.Next(0, 10));
            }

            return code.ToString();
        }

        /// <summary>
        /// 生成安全的随机令牌
        /// </summary>
        public static string GenerateSecureToken(int length = 32)
        {
            var randomBytes = new byte[length];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes);
        }

        /// <summary>
        /// 密码强度验证
        /// </summary>
        public static bool ValidatePasswordStrength(string password)
        {
            if (string.IsNullOrEmpty(password) || password.Length < 6)
                return false;

            var hasNumber = password.Any(char.IsDigit);
            var hasUpper = password.Any(char.IsUpper);
            var hasLower = password.Any(char.IsLower);

            return hasNumber && hasUpper && hasLower;
        }
    }
}
