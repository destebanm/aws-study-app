import React, { useState, useEffect } from 'react';
import './NotesReview.css';

const getNotes = () => JSON.parse(localStorage.getItem('aws-notes') || '{}');

const NotesReview = () => {
  const [questions, setQuestions] = useState([]);
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

        setQuestions(questionsData);
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
    if (window.confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      const updatedNotes = { ...notes };
      delete updatedNotes[questionId];
      setNotes(updatedNotes);
      localStorage.setItem('aws-notes', JSON.stringify(updatedNotes));
      
      // Remove from questions with notes list
      setQuestionsWithNotes(questionsWithNotes.filter(q => q.id !== questionId));
    }
  };

  if (isLoading) {
    return <div>Cargando tus notas...</div>;
  }

  return (
    <div className="notes-review-container">
      <h2>Mis Notas de Estudio</h2>
      <p>Aquí puedes revisar todas las preguntas sobre las que has tomado notas.</p>
      
      {questionsWithNotes.length === 0 ? (
        <div className="no-notes">
          <p>Aún no tienes notas guardadas. Durante los exámenes, puedes escribir notas en cada pregunta para revisarlas posteriormente.</p>
        </div>
      ) : (
        <>
          <div className="notes-stats">
            <span><strong>{questionsWithNotes.length}</strong> preguntas con notas</span>
          </div>
          <div className="notes-list">
            {questionsWithNotes.map((question, index) => (
              <div key={question.id} className="note-card">
                <div className="question-header">
                  <h3>Pregunta #{question.id.replace('q', '')}</h3>
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
                  <strong>Explicación:</strong> {question.explanation}
                </div>
                <div className="note-section">
                  <label><strong>Tus notas:</strong></label>
                  <textarea
                    value={question.note}
                    onChange={(e) => updateNote(question.id, e.target.value)}
                    rows="3"
                    placeholder="Escribe tus notas aquí..."
                  />
                  <div className="note-actions">
                    <button 
                      onClick={() => deleteNote(question.id)}
                      className="delete-btn"
                    >
                      Eliminar Nota
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