using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Common.Extensions
{

    public static class EnumerableExtensions
    {
        /// <summary>
        /// 分页扩展方法
        /// </summary>
        public static IQueryable<T> Paginate<T>(this IQueryable<T> query, int pageNumber, int pageSize)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            return query.Skip((pageNumber - 1) * pageSize).Take(pageSize);
        }

        /// <summary>
        /// 安全的Where条件，避免空引用
        /// </summary>
        public static IQueryable<T> WhereIf<T>(this IQueryable<T> query, bool condition, Expression<Func<T, bool>> predicate)
        {
            return condition ? query.Where(predicate) : query;
        }

        /// <summary>
        /// 安全的Where条件，基于字符串是否为空
        /// </summary>
        public static IQueryable<T> WhereIfNotEmpty<T>(this IQueryable<T> query, string value, Expression<Func<T, bool>> predicate)
        {
            return !string.IsNullOrWhiteSpace(value) ? query.Where(predicate) : query;
        }

        /// <summary>
        /// 去重并保留第一个元素
        /// </summary>
        public static IEnumerable<T> DistinctBy<T, TKey>(this IEnumerable<T> source, Func<T, TKey> keySelector)
        {
            var seenKeys = new HashSet<TKey>();
            foreach (var element in source)
            {
                if (seenKeys.Add(keySelector(element)))
                {
                    yield return element;
                }
            }
        }
    }
}
