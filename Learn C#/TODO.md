# TODO: Funzioni da Aggiungere a ContactManager

## 1. Ricerca e Filtri
- [ x ] `FindByName(string name, string surname)` - Cerca contatto per nome completo
- [ X ] `SearchByPartialName(string searchTerm)` - Ricerca parziale nel nome/cognome
- [ X ] `GetContactsByAgeRange(int minAge, int maxAge)` - Filtra per range di età
- [ X ] `GetAdults()` - Restituisce solo adulti (età >= 18)
- [ X ] `GetMinors()` - Restituisce solo minori (età < 18)

## 2. Aggiornamento
- [ X ] `UpdateContact(Contact, newName, newSurname, newAge)` - Aggiorna dati completi
- [ X ] `UpdateAge(Contact, newAge)` - Aggiorna solo età

## 3. Statistiche
- [ X ] `GetAverageAge()` - Calcola età media
- [ X ] `GetYoungest()` - Trova contatto più giovane
- [ X ] `GetOldest()` - Trova contatto più anziano

## 4. Gestione Gruppi
- [ X ] `GroupBySurname()` - Raggruppa per cognome
- [ X ] `GroupByAge()` - Raggruppa per età
- [ X ] `GroupByAgeCategory()` - Raggruppa per categoria (Minore/Adulto/Senior)

## 5. Import/Export
- [ ] `SaveToFile(string filePath)` - Salva su file CSV
- [ ] `LoadFromFile(string filePath)` - Carica da file CSV
- [ ] `ExportToJson()` - Export in formato JSON
- [ ] `ExportToCsv()` - Export in formato CSV

## 6. Validazione
- [ ] `ContactExists(string name, string surname)` - Controlla se contatto esiste
- [ ] `FindDuplicates()` - Trova contatti duplicati
- [ ] `IsValidAge(int age)` - Valida età (0-120)
- [ ] `IsValidName(string name)` - Valida nome (non vuoto, min 2 caratteri)

## 7. Operazioni Bulk
- [ ] `RemoveByAgeRange(int minAge, int maxAge)` - Rimuove contatti per range età
- [ ] `RemoveAll(Func<Contact, bool> predicate)` - Rimuove con condizione personalizzata
- [ ] `AddRange(IEnumerable<Contact>)` - Aggiungi multipli contatti in una volta

---

**Nota:** Implementa le funzioni in ordine di priorità in base alle tue esigenze!