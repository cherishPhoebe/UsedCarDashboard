using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class MenuButton
    {
        public long Id { get; set; }
        public long MenuId { get; set; }
        public string Code { get; set; } = null!;
        public string Label { get; set; } = null!;
        public int SortOrder { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
