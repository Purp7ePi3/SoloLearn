namespace MyApp.Services
{
    using System;
    using System.Linq;
    using MyApp.Data;

    public class Finder
    {
        private readonly IContactRepository _repository;

        public Finder(IContactRepository repository)
        {
            _repository = repository;
        }

        public Contact? FindByExactName(string name)
        {
            return _repository.GetAll()
                .FirstOrDefault(c =>
                    c.Name.Equals(name, StringComparison.OrdinalIgnoreCase) ||
                    c.Surname.Equals(name, StringComparison.OrdinalIgnoreCase));
        }

        public Contact? FindByPartialName(string searchTerm)
        {
            return _repository.GetAll()
                .FirstOrDefault(c =>
                    c.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                    c.Surname.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
        }

        public IEnumerable<Contact> GetByAgeRange(int minAge, int maxAge)
        {
            return _repository.GetAll()
                .Where(c => c.Age >= minAge && c.Age <= maxAge);
        }

        public IEnumerable<Contact> GetAdults()
        {
            return _repository.GetAll().Where(c => c.Age >= 18);
        }

        public IEnumerable<Contact> GetMinors()
        {
            return _repository.GetAll().Where(c => c.Age < 18);
        }
    }
}