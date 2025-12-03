import { Upload, Download, Calendar, BookOpen, GraduationCap, Mail, Edit2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { mockUser, mockNotes } from '@/data/mockData';
import NoteCard from '@/components/notes/NoteCard';

const Profile = () => {
  const userNotes = mockNotes.filter((note) => note.author === mockUser.name);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const stats = [
    { label: 'Uploaded', value: mockUser.uploadedNotes, icon: Upload, color: 'text-primary' },
    { label: 'Downloaded', value: mockUser.downloadedNotes, icon: Download, color: 'text-success' },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      <main className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                      <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                      <AvatarFallback className="bg-gradient-primary text-2xl font-bold text-primary-foreground">
                        {mockUser.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <h2 className="text-xl font-bold text-foreground">{mockUser.name}</h2>
                  <Badge variant="secondary" className="mt-2">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    {mockUser.major}
                  </Badge>

                  <div className="mt-4 w-full space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {mockUser.university}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="h-4 w-4" />
                      {mockUser.email}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Joined {formatDate(mockUser.joinDate)}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid w-full grid-cols-2 gap-4">
                    {stats.map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div key={stat.label} className="text-center">
                          <div className="flex items-center justify-center gap-1.5 mb-1">
                            <Icon className={`h-4 w-4 ${stat.color}`} />
                            <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      );
                    })}
                  </div>

                  <Button variant="outline" className="mt-6 w-full">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Uploaded Notes</CardTitle>
                    <CardDescription>Manage and view all the notes you've shared</CardDescription>
                  </div>
                  <Button variant="gradient" asChild>
                    <a href="/upload">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {userNotes.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {userNotes.map((note, index) => (
                      <NoteCard key={note.id} note={note} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No notes uploaded yet</h3>
                    <p className="text-muted-foreground max-w-sm mb-4">
                      Start sharing your knowledge! Upload your first note and help fellow students.
                    </p>
                    <Button variant="gradient" asChild>
                      <a href="/upload">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Your First Note
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
