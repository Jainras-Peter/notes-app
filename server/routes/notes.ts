import { RequestHandler } from 'express';
import { Note } from '../models/Note';
import { AuthRequest } from '../middleware/auth';
import { isDatabaseConnected } from '../config/database';
import { mockNoteService } from '../services/mockData';
import { NotesResponse, CreateNoteRequest } from '@shared/api';

export const getNotes: RequestHandler = async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        notes: []
      } as NotesResponse);
    }

    const notes = isDatabaseConnected()
      ? await Note.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean()
      : await (await mockNoteService.find({ userId: req.user.id })).sort().lean();

    const formattedNotes = notes.map(note => ({
      id: note._id.toString(),
      title: note.title,
      content: note.content,
      userId: note.userId.toString(),
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    }));

    const response: NotesResponse = {
      success: true,
      notes: formattedNotes
    };

    res.json(response);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      notes: []
    } as NotesResponse);
  }
};

export const createNote: RequestHandler = async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { title, content }: CreateNoteRequest = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    if (title.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Title must be 200 characters or less'
      });
    }

    // Create note
    const noteData = {
      title: title.trim(),
      content: content.trim(),
      userId: req.user.id,
    };

    const note = isDatabaseConnected()
      ? await new Note(noteData).save()
      : await (await mockNoteService.create(noteData)).save();

    const formattedNote = {
      id: note._id.toString(),
      title: note.title,
      content: note.content,
      userId: note.userId.toString(),
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note: formattedNote
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateNote: RequestHandler = async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { id } = req.params;
    const { title, content }: CreateNoteRequest = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    if (title.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Title must be 200 characters or less'
      });
    }

    // Find and update note
    const updateData = {
      title: title.trim(),
      content: content.trim(),
      updatedAt: new Date()
    };

    const note = isDatabaseConnected()
      ? await Note.findOneAndUpdate(
          { _id: id, userId: req.user.id },
          updateData,
          { new: true, lean: true }
        )
      : await mockNoteService.findOneAndUpdate(
          { _id: id, userId: req.user.id },
          updateData
        );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    const formattedNote = {
      id: note._id.toString(),
      title: note.title,
      content: note.content,
      userId: note.userId.toString(),
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };

    res.json({
      success: true,
      message: 'Note updated successfully',
      note: formattedNote
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteNote: RequestHandler = async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { id } = req.params;

    // Find and delete note
    const note = isDatabaseConnected()
      ? await Note.findOneAndDelete({ _id: id, userId: req.user.id })
      : await mockNoteService.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
