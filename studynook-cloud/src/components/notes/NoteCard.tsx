import { Download, FileText, FileImage, Presentation, File, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Note } from '@/types/note';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NoteCardProps {
  note: Note;
  index: number;
}

const fileTypeConfig = {
  pdf: { icon: FileText, color: 'text-destructive', bg: 'bg-destructive/10' },
  doc: { icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
  ppt: { icon: Presentation, color: 'text-warning', bg: 'bg-warning/10' },
  txt: { icon: File, color: 'text-muted-foreground', bg: 'bg-muted' },
  image: { icon: FileImage, color: 'text-success', bg: 'bg-success/10' },
};

const subjectColors: Record<string, string> = {
  Mathematics: 'bg-primary/10 text-primary border-primary/20',
  Physics: 'bg-accent/10 text-accent border-accent/20',
  Chemistry: 'bg-success/10 text-success border-success/20',
  Biology: 'bg-success/10 text-success border-success/20',
  'Computer Science': 'bg-primary/10 text-primary border-primary/20',
  Literature: 'bg-warning/10 text-warning border-warning/20',
  History: 'bg-warning/10 text-warning border-warning/20',
  Economics: 'bg-accent/10 text-accent border-accent/20',
  Psychology: 'bg-destructive/10 text-destructive border-destructive/20',
  Other: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

const NoteCard = ({ note, index }: NoteCardProps) => {
  const FileIcon = fileTypeConfig[note.fileType].icon;
  const fileConfig = fileTypeConfig[note.fileType];

  const handleDownload = () => {
    toast.success(`Downloading "${note.title}"`, {
      description: 'Your download will start shortly.',
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1 hover:border-primary/30',
        'animate-fade-in'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', fileConfig.bg)}>
            <FileIcon className={cn('h-6 w-6', fileConfig.color)} />
          </div>
          <Badge variant="outline" className={cn('text-xs font-medium', subjectColors[note.subject])}>
            {note.subject}
          </Badge>
        </div>
        <h3 className="mt-3 font-semibold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {note.title}
        </h3>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{note.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-0">
        <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDate(note.uploadDate)}
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            {note.downloads} downloads
          </div>
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {note.fileSize} • by {note.author}
          </span>
          <Button size="sm" variant="gradient" onClick={handleDownload} className="gap-1.5">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default NoteCard;
