import { useState, useMemo } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import NoteCard from '@/components/notes/NoteCard';
import FilterBar from '@/components/notes/FilterBar';
import { mockNotes } from '@/data/mockData';
import { FilterOptions } from '@/types/note';

const Index = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    subject: 'All',
    fileType: 'All',
    sortBy: 'newest',
    searchQuery: '',
  });

  const filteredNotes = useMemo(() => {
    let result = [...mockNotes];

    // Filter by subject
    if (filters.subject !== 'All') {
      result = result.filter((note) => note.subject === filters.subject);
    }

    // Filter by file type
    if (filters.fileType !== 'All') {
      result = result.filter((note) => note.fileType === filters.fileType);
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.subject.toLowerCase().includes(query) ||
          note.description.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
        break;
      case 'oldest':
        result.sort((a, b) => a.uploadDate.getTime() - b.uploadDate.getTime());
        break;
      case 'most-downloaded':
        result.sort((a, b) => b.downloads - a.downloads);
        break;
      case 'alphabetical':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [filters]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      <main className="container py-8">
        {/* Hero Section */}
        <section className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            Shared by students, for students
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
            Find the <span className="text-gradient">Perfect Notes</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Access thousands of high-quality study notes shared by students from universities around the world.
            Download, learn, and ace your exams.
          </p>
        </section>

        {/* Filter Section */}
        <section className="mb-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
          <FilterBar filters={filters} onFilterChange={setFilters} totalResults={filteredNotes.length} />
        </section>

        {/* Notes Grid */}
        <section>
          {filteredNotes.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredNotes.map((note, index) => (
                <NoteCard key={note.id} note={note} index={index} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No notes found</h3>
              <p className="text-muted-foreground max-w-sm">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
