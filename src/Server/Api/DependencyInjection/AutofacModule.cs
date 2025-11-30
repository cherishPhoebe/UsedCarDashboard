using Application.Services;
using Autofac;
using Domain.Interfaces.Repositories;
using Domain.Interfaces.Services;
using Infrastructure.Repositories;

namespace Api.DependencyInjection
{
    public class AutofacModule : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            // 注册仓储层
            //builder.RegisterType<UserRepository>().As<IUserRepository>().InstancePerLifetimeScope();
            builder.RegisterType<UnitOfWork>().As<IUnitOfWork>().InstancePerLifetimeScope();

            // 注册服务层
            //builder.RegisterType<AuthService>().As<IAuthService>().InstancePerLifetimeScope();
            //builder.RegisterType<JwtService>().As<IJwtService>().InstancePerLifetimeScope();
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
