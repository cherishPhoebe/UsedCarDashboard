using System.Text.Json.Serialization;

namespace Shared.Enums
{

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum UserRoleEnum
    {
        User = 1,
        Admin = 2,
        SuperAdmin = 3
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum CarStatus
    {
        Available = 1,
        Sold = 2,
        Reserved = 3,
        Maintenance = 4
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum SaleStatus
    {
        Pending = 1,
        Completed = 2,
        Cancelled = 3
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum CarType
    {
        Sedan = 1,
        SUV = 2,
        Truck = 3,
        Coupe = 4,
        Hatchback = 5
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum FuelType
    {
        Gasoline = 1,
        Diesel = 2,
        Electric = 3,
        Hybrid = 4
    }
}
