namespace MyApp.Data
{
    public interface IContactRepository
    {
        Contact Add(string name, string surname, int age);
        bool Remove(Contact contact);
        bool Update(Contact contact, string newName, string newSurname, int newAge);
        List<Contact> GetAll();
        bool UpdateAge(Contact contact, int newAge);

        Contact ?GetYoungest(bool reverse = true);
        Contact ?GetOldest();
        float GetAverageAge();
        int Count();
    }
}