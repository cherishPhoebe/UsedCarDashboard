using Application.Security;
using Application.Services;
using Autofac;
using Domain.Repositories;
using Domain.Services;
using Infrastructure.Repositories;
using Infrastructure.SqlSugar;
using Microsoft.Extensions.Configuration;
using Shared.Auth;
using Shared.Redis;
using Shared.Security;
using SqlSugar;
using StackExchange.Redis;

namespace Infrastructure.DI
{
    public class AutofacModule : Module
    {
        private readonly IConfiguration _configuration;
        public AutofacModule(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        protected override void Load(ContainerBuilder builder)
        {
            //var conn = _configuration.GetConnectionString("RbacDb");
            //var db = SqlSugarFactory.Create(conn);
            //builder.RegisterInstance(db).As<SqlSugarClient>().SingleInstance();

            // Redis connection multiplexer
            var redisConn = ConnectionMultiplexer.Connect(_configuration["Redis:Configuration"]);
            builder.RegisterInstance(redisConn).As<IConnectionMultiplexer>().SingleInstance();
            builder.RegisterType<RedisCacheService>().As<Shared.Redis.ICacheService>().InstancePerLifetimeScope();

            // App services & helpers
            builder.RegisterType<Pbkdf2PasswordHasher>().As<IPasswordHasher>().SingleInstance();
            builder.RegisterType<JwtHelper>().SingleInstance();
            builder.RegisterType<PermissionChecker>().As<IPermissionChecker>().InstancePerLifetimeScope();
        }
    }

    public class RepositoryModule : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            var repositoryAssembly = typeof(UserRepository).Assembly;
            builder.RegisterAssemblyTypes(repositoryAssembly)
                   .Where(t => t.Name.EndsWith("Repository"))
                   .AsImplementedInterfaces()
                   .InstancePerLifetimeScope();
        }
    }

    public class ServiceModule : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            var serviceAssembly = typeof(AuthService).Assembly;
            builder.RegisterAssemblyTypes(serviceAssembly)
                   .Where(t => t.Name.EndsWith("Service"))
                   .AsImplementedInterfaces()
                   .InstancePerLifetimeScope();
        }
    }
}
