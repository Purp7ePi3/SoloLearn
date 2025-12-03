import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FilterOptions, Subject, FileType } from '@/types/note';
import { subjects, fileTypes } from '@/data/mockData';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  totalResults: number;
}

const FilterBar = ({ filters, onFilterChange, totalResults }: FilterBarProps) => {
  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes by title, subject, or tag..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="pl-10 bg-card"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {totalResults} {totalResults === 1 ? 'note' : 'notes'} found
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filters:</span>
        </div>

        <Select
          value={filters.subject}
          onValueChange={(value) => updateFilter('subject', value as Subject | 'All')}
        >
          <SelectTrigger className="w-40 bg-card">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.fileType}
          onValueChange={(value) => updateFilter('fileType', value as FileType | 'All')}
        >
          <SelectTrigger className="w-32 bg-card">
            <SelectValue placeholder="File Type" />
          </SelectTrigger>
          <SelectContent>
            {fileTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type === 'All' ? 'All Types' : type.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.sortBy}
          onValueChange={(value) => updateFilter('sortBy', value as FilterOptions['sortBy'])}
        >
          <SelectTrigger className="w-40 bg-card">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="most-downloaded">Most Downloaded</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>

        {(filters.subject !== 'All' || filters.fileType !== 'All' || filters.searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onFilterChange({
                subject: 'All',
                fileType: 'All',
                sortBy: filters.sortBy,
                searchQuery: '',
              })
            }
            className="text-muted-foreground hover:text-foreground"
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
