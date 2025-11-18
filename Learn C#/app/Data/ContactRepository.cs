namespace MyApp.Data
{
    public class ContactRepository : IContactRepository
    {
        private readonly List<Contact> _contacts = new();

        public Contact Add(string name, string surname, int age)
        {
            var contact = new Contact(name, surname, age);
            _contacts.Add(contact);
            return contact;
        }

        public bool Remove(Contact contact)
        {
            return _contacts.Remove(contact);
        }

        public bool Update(Contact contact, string newName, string newSurname, int newAge)
        {
            if (!_contacts.Contains(contact))
            {
                return false;
            }

            contact.Name = newName;
            contact.Surname = newSurname;
            contact.Age = newAge;
            return true;
        }
        
        public bool UpdateAge(Contact contact, int newAge) {
            return Update(contact, contact.Name, contact.Surname, newAge);
        }

        public float GetAverageAge(){
            float average = 0; 
            foreach (var item in _contacts.ToList())
            {
                average += item.Age;
            }
            return average/_contacts.Count();
        }
        
        public List<Contact> GetAll()
        {
            return _contacts;
        }

        public int Count()
        {
            return _contacts.Count;
        }

        public Contact? GetYoungest(bool reverse = true)
        {
            return _contacts
                .OrderBy(c => !reverse ? -c.Age : c.Age)
                .FirstOrDefault();
        }

        public Contact? GetOldest()
        {
            return GetYoungest(false);
        }
    }
}