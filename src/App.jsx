import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = "http://localhost:8080/api/notes";

function App() {
  const [notes, setNotes] = useState([]);
  const [orgId, setOrgId] = useState("ORG-001");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}?orgId=${orgId}`);
      setNotes(res.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, [orgId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingNote) {
        await axios.put(`${API_BASE}/${editingNote.id}`, {
          ...editingNote,
          title,
          content,
        });
        setEditingNote(null);
      } else {
        await axios.post(API_BASE, {
          title,
          content,
          organizationId: orgId,
        });
      }
      
      setTitle("");
      setContent("");
      setShowForm(false);
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
    }
    setLoading(false);
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this note?");
    if (!confirmed) return;
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
    setLoading(false);
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setTitle("");
    setContent("");
    setShowForm(false);
  };

  const filteredNotes = notes.filter(note =>
    note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <span className="logo-icon">📒</span>
              <div className="logo-text">
                <h1>NotesApp</h1>
                <p>B2B Knowledge Management</p>
              </div>
            </div>
          </div>
          
          <div className="header-right">
            <div className="org-switcher">
              <span className="org-icon">🏢</span>
              <input
                type="text"
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                placeholder="Organization ID"
              />
            </div>
            
            <button
              className="btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              <span className="btn-icon">➕</span>
              New Note
            </button>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Search Bar */}
        <div className="search-section">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Note Form */}
        {showForm && (
          <div className="note-form-container">
            <div className="form-header">
              <h2>{editingNote ? "Edit Note" : "Create New Note"}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="note-form">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Enter note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <textarea
                  placeholder="Write your note content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={4}
                  className="form-textarea"
                />
              </div>
              
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? "Saving..." : (editingNote ? "Update Note" : "Create Note")}
                </button>
                
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && notes.length === 0 && (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        )}

        {/* Notes Grid */}
        {!loading || notes.length > 0 ? (
          <div className="notes-grid">
            {filteredNotes.map((note) => (
              <div key={note.id} className="note-card">
                <div className="note-header">
                  <h3 className="note-title">{note.title}</h3>
                  <div className="note-actions">
                    <button
                      onClick={() => handleEdit(note)}
                      className="action-btn edit-btn"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="action-btn delete-btn"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <p className="note-content">{note.content}</p>
                
                <div className="note-footer">
                  <span className="note-date">
                    🕒 {formatDate(note.createdAt)}
                  </span>
                  <span className="note-org">{note.organizationId || orgId}</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Empty State */}
        {filteredNotes.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>
              {searchQuery ? "No notes found" : `No notes yet for ${orgId}`}
            </h3>
            <p>
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Create your first note to get started"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Create First Note
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;