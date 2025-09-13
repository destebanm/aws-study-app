import React, { useState, useEffect } from 'react';
import './NotesReview.css';

const getNotes = () => JSON.parse(localStorage.getItem('aws-notes') || '{}');

const NotesReview = () => {
  const [notes, setNotes] = useState({});
  const [questionsWithNotes, setQuestionsWithNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load questions and notes
    const loadData = async () => {
      try {
        // Fetch questions
        const response = await fetch(process.env.PUBLIC_URL + '/questions.json');
        const questionsData = await response.json();
        
        // Get notes from localStorage
        const notesData = getNotes();
        
        // Filter questions that have notes
        const questionsWithNotesData = questionsData.filter(q => 
          notesData[q.id] && notesData[q.id].trim()
        ).map(q => ({
          ...q,
          note: notesData[q.id]
        }));

        setNotes(notesData);
        setQuestionsWithNotes(questionsWithNotesData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const updateNote = (questionId, newNote) => {
    const updatedNotes = { ...notes, [questionId]: newNote };
    setNotes(updatedNotes);
    localStorage.setItem('aws-notes', JSON.stringify(updatedNotes));
    
    // Update the questions with notes list
    const updatedQuestionsWithNotes = questionsWithNotes.map(q => 
      q.id === questionId ? { ...q, note: newNote } : q
    ).filter(q => q.note && q.note.trim());
    
    setQuestionsWithNotes(updatedQuestionsWithNotes);
  };

  const deleteNote = (questionId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const updatedNotes = { ...notes };
      delete updatedNotes[questionId];
      setNotes(updatedNotes);
      localStorage.setItem('aws-notes', JSON.stringify(updatedNotes));
      
      // Remove from questions with notes list
      setQuestionsWithNotes(questionsWithNotes.filter(q => q.id !== questionId));
    }
  };

  if (isLoading) {
    return <div>Loading your notes...</div>;
  }

  return (
    <div className="notes-review-container">
      <h2>My Study Notes</h2>
      <p>Here you can review all the questions you've taken notes on.</p>
      
      {questionsWithNotes.length === 0 ? (
        <div className="no-notes">
          <p>You don't have any saved notes yet. During exams, you can write notes for each question to review them later.</p>
        </div>
      ) : (
        <>
          <div className="notes-stats">
            <span><strong>{questionsWithNotes.length}</strong> questions with notes</span>
          </div>
          <div className="notes-list">
            {questionsWithNotes.map((question, index) => (
              <div key={question.id} className="note-card">
                <div className="question-header">
                  <h3>Question #{question.id.replace('q', '')}</h3>
                  <span className="service-tag">{question.awsService}</span>
                </div>
                <div className="question-text">
                  <h4>{question.questionText}</h4>
                </div>
                <div className="question-options">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className={`option ${option.isCorrect ? 'correct-option' : ''}`}>
                      {option.isCorrect && '✓ '}{option.text}
                    </div>
                  ))}
                </div>
                <div className="explanation">
                  <strong>Explanation:</strong> {question.explanation}
                </div>
                <div className="note-section">
                  <label><strong>Your notes:</strong></label>
                  <textarea
                    value={question.note}
                    onChange={(e) => updateNote(question.id, e.target.value)}
                    rows="3"
                    placeholder="Write your notes here..."
                  />
                  <div className="note-actions">
                    <button 
                      onClick={() => deleteNote(question.id)}
                      className="delete-btn"
                    >
                      Delete Note
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default NotesReview;