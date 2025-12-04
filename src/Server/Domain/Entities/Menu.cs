using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Menu
    {
        public long Id { get; set; }
        public string Code { get; set; } = null!;
        public string Title { get; set; } = null!;
        public long? ParentId { get; set; }
        public string? Path { get; set; }
        public string? Component { get; set; }
        public string? Icon { get; set; }
        public int SortOrder { get; set; }
        public bool IsVisible { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
