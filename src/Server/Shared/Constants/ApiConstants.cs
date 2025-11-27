using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shared.Constants
{
    public static class ApiConstants
    {
        public const string ApiVersion = "v1";
        public const string ApiBasePath = "/api";

        // 缓存键常量
        public static class CacheKeys
        {
            public const string UserCacheKey = "User_{0}";
            public const string VerificationCodeKey = "VerificationCode_{0}";
            public const string DashboardDataKey = "DashboardData_{0}";
        }

        // 配置键常量
        public static class ConfigurationKeys
        {
            public const string DatabaseConnection = "ConnectionStrings:DefaultConnection";
            public const string JwtSettings = "Jwt";
            public const string CorsPolicy = "Cors:AllowedOrigins";
        }
    }

    public static class ErrorMessages
    {
        public const string UserNotFound = "用户不存在";
        public const string InvalidCredentials = "用户名或密码错误";
        public const string UserAlreadyExists = "用户已存在";
        public const string EmailAlreadyRegistered = "邮箱已被注册";
        public const string InvalidVerificationCode = "验证码错误";
        public const string PasswordTooWeak = "密码强度不足";
        public const string InvalidEmailFormat = "邮箱格式不正确";

        public const string InternalServerError = "服务器内部错误";
        public const string UnauthorizedAccess = "未授权访问";
        public const string InvalidRequest = "请求参数无效";
    }

    public static class SuccessMessages
    {
        public const string LoginSuccess = "登录成功";
        public const string RegisterSuccess = "注册成功";
        public const string OperationSuccess = "操作成功";
        public const string DataSaved = "数据保存成功";
    }
}
