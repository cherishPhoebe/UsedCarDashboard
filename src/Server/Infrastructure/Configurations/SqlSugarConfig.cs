using Infrastructure.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SqlSugar;

namespace Infrastructure.Configurations
{
    public static class SqlSugarConfig
    {
        public static IServiceCollection AddSqlSugar(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            services.AddScoped<ISqlSugarClient>(provider =>
            {
                return new SqlSugarClient(new ConnectionConfig
                {
                    ConnectionString = connectionString,
                    DbType = DbType.SqlServer,
                    IsAutoCloseConnection = true,
                    InitKeyType = InitKeyType.Attribute
                });
            });

            services.AddScoped<AppDbContext>();

            return services;
        }
    }
}
