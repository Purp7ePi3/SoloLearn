namespace MyApp.UI
{
    using System;
    using System.Collections.Generic;
    using MyApp.Data;

    public class Display
    {
        public void Show(Contact contact, string prefix = "")
        {
            Console.WriteLine($"{prefix}Contact: {contact}");
        }

        public void ShowAll(IEnumerable<Contact> contacts, string header = "")
        {
            if (!string.IsNullOrEmpty(header))
            {
                Console.WriteLine(header);
            }

            foreach (var contact in contacts)
            {
                Console.WriteLine($"\t{contact}");
            }
        }

        public void ShowSearchResult(Contact? contact, string searchType)
        {
            if (contact != null)
            {
                Console.WriteLine($"Contact found ({searchType}): {contact}");
            }
            else
            {
                Console.WriteLine($"No contact found ({searchType})");
            }
        }
    }
}