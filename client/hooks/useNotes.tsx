import { useState, useEffect } from 'react';
import { Note, NotesResponse, CreateNoteRequest } from '@shared/api';
import { useAuth } from './useAuth';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, isAuthenticated } = useAuth();

  const fetchNotes = async () => {
    if (!token || !isAuthenticated) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data: NotesResponse = await response.json();
      
      if (data.success) {
        setNotes(data.notes);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async (noteData: CreateNoteRequest): Promise<boolean> => {
    if (!token || !isAuthenticated) return false;

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(noteData),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh notes after creation
        await fetchNotes();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating note:', error);
      return false;
    }
  };

  const updateNote = async (id: string, noteData: CreateNoteRequest): Promise<boolean> => {
    if (!token || !isAuthenticated) return false;

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(noteData),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh notes after update
        await fetchNotes();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating note:', error);
      return false;
    }
  };

  const deleteNote = async (id: string): Promise<boolean> => {
    if (!token || !isAuthenticated) return false;

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove from local state immediately for better UX
        setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [token, isAuthenticated]);

  return {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes,
  };
};
