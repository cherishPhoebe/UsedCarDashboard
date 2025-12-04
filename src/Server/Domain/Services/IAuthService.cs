using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Services
{
    public interface IAuthService
    {
        Task<(string accessToken, string refreshToken)> LoginAsync(string userName, string password);
        Task<(string accessToken, string refreshToken)> RefreshAsync(string refreshToken);
    }
}
