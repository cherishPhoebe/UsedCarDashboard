using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Extensions
{
    public static class DateTimeExtensions
    {
        /// <summary>
        /// 转换为时间戳（秒）
        /// </summary>
        public static long ToUnixTimestamp(this DateTime dateTime)
        {
            return ((DateTimeOffset)dateTime).ToUnixTimeSeconds();
        }

        /// <summary>
        /// 转换为时间戳（毫秒）
        /// </summary>
        public static long ToUnixTimestampMilliseconds(this DateTime dateTime)
        {
            return ((DateTimeOffset)dateTime).ToUnixTimeMilliseconds();
        }

        /// <summary>
        /// 时间戳转换为DateTime
        /// </summary>
        public static DateTime FromUnixTimestamp(long timestamp)
        {
            return DateTimeOffset.FromUnixTimeSeconds(timestamp).DateTime;
        }

        /// <summary>
        /// 获取一天的开始时间（00:00:00）
        /// </summary>
        public static DateTime StartOfDay(this DateTime dateTime)
        {
            return dateTime.Date;
        }

        /// <summary>
        /// 获取一天的结束时间（23:59:59）
        /// </summary>
        public static DateTime EndOfDay(this DateTime dateTime)
        {
            return dateTime.Date.AddDays(1).AddTicks(-1);
        }

        /// <summary>
        /// 转换为友好时间显示（如：刚刚，5分钟前）
        /// </summary>
        public static string ToFriendlyDisplay(this DateTime dateTime)
        {
            var span = DateTime.Now - dateTime;

            if (span.TotalSeconds < 60)
                return "刚刚";
            if (span.TotalMinutes < 60)
                return $"{(int)span.TotalMinutes}分钟前";
            if (span.TotalHours < 24)
                return $"{(int)span.TotalHours}小时前";
            if (span.TotalDays < 7)
                return $"{(int)span.TotalDays}天前";

            return dateTime.ToString("yyyy-MM-dd");
        }
    }
}
