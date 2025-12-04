
using Autofac;
using Autofac.Extensions.DependencyInjection;
using Infrastructure.Configurations;
using Infrastructure.DI;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Reflection;
using System.Text;

var builder = WebApplication.CreateBuilder(args);


// 使用Autofac作为DI容器
builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory());

builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

// 添加基础设施服务
builder.Services.AddSqlSugar(builder.Configuration);

// 添加AutoMapper
builder.Services.AddAutoMapper(configAction => { }, typeof(Program).Assembly);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// 添加控制器
builder.Services.AddControllers();

// 配置Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "UsedCarDashboard API", Version = "v1" });

    // 添加JWT认证到Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// 配置JWT认证// JWT configuration
var jwt = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwt["Key"]);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwt["Issuer"],
        ValidAudience = jwt["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

// Configure Autofac Container
//builder.Host.ConfigureContainer<ContainerBuilder>(containerBuilder =>
//{
//    containerBuilder.RegisterModule(new AutofacModule(builder.Configuration));
//});
builder.Host.ConfigureContainer<ContainerBuilder>(containerBuilder =>
{
    // 按模块注册依赖
    containerBuilder.RegisterModule(new RepositoryModule());
    containerBuilder.RegisterModule(new ServiceModule());
    containerBuilder.RegisterModule(new AutofacModule(builder.Configuration));
});

// 配置CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// 初始化数据库
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<Infrastructure.Data.AppDbContext>();
    context.InitializeDatabase();
}

// 配置HTTP请求管道
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

