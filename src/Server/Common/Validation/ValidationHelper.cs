using System.Text.RegularExpressions;

namespace Common.Validation
{

    public static class ValidationHelper
    {
        private static readonly Regex EmailRegex = new Regex(
            @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
            RegexOptions.Compiled | RegexOptions.IgnoreCase);

        private static readonly Regex UsernameRegex = new Regex(
            @"^[a-zA-Z0-9_]{3,50}$",
            RegexOptions.Compiled);

        /// <summary>
        /// 验证邮箱格式
        /// </summary>
        public static bool IsValidEmail(string email)
        {
            return !string.IsNullOrEmpty(email) && EmailRegex.IsMatch(email);
        }

        /// <summary>
        /// 验证用户名格式
        /// </summary>
        public static bool IsValidUsername(string username)
        {
            return !string.IsNullOrEmpty(username) && UsernameRegex.IsMatch(username);
        }

        /// <summary>
        /// 验证手机号格式（中国）
        /// </summary>
        public static bool IsValidChinesePhoneNumber(string phoneNumber)
        {
            if (string.IsNullOrEmpty(phoneNumber))
                return false;

            var regex = new Regex(@"^1[3-9]\d{9}$");
            return regex.IsMatch(phoneNumber);
        }

        /// <summary>
        /// 验证身份证号格式（中国）
        /// </summary>
        public static bool IsValidChineseIdCard(string idCard)
        {
            if (string.IsNullOrEmpty(idCard) || (idCard.Length != 15 && idCard.Length != 18))
                return false;

            var regex = new Regex(@"^\d{15}|\d{17}[\dXx]$");
            return regex.IsMatch(idCard);
        }
    }
}
