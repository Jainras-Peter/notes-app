import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, LogOut, Trash2 } from "lucide-react";

export default function DashboardPreview() {
  // Mock data for preview
  const mockUser = {
    name: "John Doe",
    email: "john.doe@example.com"
  };

  const mockNotes = [
    {
      id: "1",
      title: "Welcome to Your Notes",
      content: "This is your first note! You can create, edit, and delete notes here. This app is running in development mode with mock data since no MongoDB connection is available.",
      createdAt: "2024-01-15T10:30:00Z"
    },
    {
      id: "2",
      title: "Meeting Notes",
      content: "Discussion points:\n- Project timeline\n- Budget allocation\n- Team assignments\n\nAction items:\n- Follow up with stakeholders\n- Prepare presentation slides",
      createdAt: "2024-01-14T15:45:00Z"
    },
    {
      id: "3",
      title: "Shopping List",
      content: "Grocery items:\n- Milk\n- Bread\n- Eggs\n- Apples\n- Chicken\n- Rice\n- Vegetables",
      createdAt: "2024-01-13T09:15:00Z"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Sign Out */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Notes App</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {mockUser.name}
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            {mockUser.email}
          </p>

          {/* Create Note Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Note title..."
                    className="w-full"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Write your note content here..."
                    className="w-full min-h-32"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline">
                    Cancel
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Create Note
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Notes List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="divide-y divide-gray-200">
            {mockNotes.map((note) => (
              <div key={note.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {note.title}
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-3">
                      {note.content}
                    </p>
                    <div className="text-sm text-gray-400">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-4 text-gray-400 hover:text-red-600 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
