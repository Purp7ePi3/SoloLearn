namespace MyApp
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using MyApp.Data;
    using MyApp.Services;
    using MyApp.UI;

    class Program
    {
        static void Main(string[] args)
        {
            // Setup
            var repository = new ContactRepository();
            var finder = new Finder(repository);
            var sorter = new Sorter(repository);
            var display = new Display();

            // Add contacts
            repository.Add("lampa", "dario", 30);
            repository.Add("trombetta", "daria", 16);
            repository.Add("lupo", "lucio", 14);
            repository.Add("lupo", "alberto", 56);


            Console.WriteLine($"Total contacts: {repository.Count()}\n");

            var comparisons = new Dictionary<string, Func<Contact, object>>
            {
                { "name", c => c.Name },
                { "age", c => c.Age },
                { "surname", c => c.Surname }
            };

            foreach (var comparison in comparisons)
            {
                var sorted = sorter.SortBy(comparison.Value, descending: true);
                display.ShowAll(sorted, $"Sorted by {comparison.Key} (descending):");
                Console.WriteLine();
            }

            var foundByName = finder.FindByExactName("lampa");
            display.ShowSearchResult(foundByName, "exact name");
            Console.WriteLine();

            var foundByPartial = finder.FindByPartialName("trom");
            display.ShowSearchResult(foundByPartial, "partial name");
            Console.WriteLine();

            var inAgeRange = finder.GetByAgeRange(15, 40);
            display.ShowAll(inAgeRange, "Age range 15-40:");
            Console.WriteLine();

            var adults = finder.GetAdults();
            display.ShowAll(adults, "Adults (18+):");
            Console.WriteLine();

            var minors = finder.GetMinors();
            display.ShowAll(minors, "Minors (<18):");
            Console.WriteLine();

            var firstContact = repository.GetAll().First();
            Console.WriteLine($"Before: {firstContact}");

            repository.Update(firstContact, "ugo", "foscolo", 10);
            Console.WriteLine($"After: {firstContact}\n");

            Console.WriteLine("All contacts after update:");
            var getAll = repository.GetAll();
            display.ShowAll(getAll);

            repository.UpdateAge(firstContact, 15);
            Console.WriteLine("All contacts after age update:");
            getAll = repository.GetAll();
            display.ShowAll(getAll);

            Console.WriteLine($"Average age: {repository.GetAverageAge()}");
            Console.WriteLine($"{repository.GetYoungest()}");

            var grouper = new Dictionary<string, Func<Contact, object>>
            {
                { "name", c => c.Name },
                { "age", c => c.Age },
                { "surname", c => c.Surname }
            };
            
           foreach (var groupers in grouper)
                {
                    Console.WriteLine($"\n=== Raggruppamento per {groupers.Key} ===");
                    var groups = sorter.GroupBy(groupers.Value);

                    foreach (var group in groups) 
                    {
                        Console.WriteLine($"\nGruppo: {group.Name}");
                        Console.WriteLine($"Numero di contatti: {group.Contacts?.Count ?? 0}");
                        
                        foreach (var contact in group.Contacts ?? Enumerable.Empty<Contact>())
                        {
                            Console.WriteLine($"  - {contact}");
                        }
                    }
                }
        }
    }
}