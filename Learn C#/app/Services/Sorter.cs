namespace MyApp.Services
{
    using System;
    using System.Linq;
    using MyApp.Data;

    public class Sorter
    {
        private readonly IContactRepository _repository;

        public Sorter(IContactRepository repository)
        {
            _repository = repository;
        }

        public List<Contact> SortBy(Func<Contact, object> keySelector, bool descending = false)
        {
            var contacts = _repository.GetAll();
            return descending
                ? contacts.OrderByDescending(keySelector).ToList()
                : contacts.OrderBy(keySelector).ToList();
        }

        public List<Contact> SortByName(bool descending = false)
        {
            return SortBy(c => c.Name, descending);
        }

        public List<Contact> SortByAge(bool descending = false)
        {
            return SortBy(c => c.Age, descending);
        }


        public class ContactGroup{
            public string? Name {get; set; }
            public List<Contact>? Contacts {get; set; }
        }

        public List<ContactGroup> GroupBy(Func<Contact, object> grouper) {
        return _repository.GetAll()
            .GroupBy(grouper)
            .Select(g => new ContactGroup
            {
                Name = g.Key?.ToString(),
                Contacts = g.ToList()
            })
            .ToList();
        }   
    }
}