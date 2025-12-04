using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Role
    {
        public long Id { get; set; }
        public string Name { get; set; } = null!;
        public string NormalizedName { get; set; } = null!;
        public string? Description { get; set; }
        public bool IsStatic { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
