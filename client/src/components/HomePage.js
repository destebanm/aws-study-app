import React, { useState, useEffect } from 'react';
import TestTaker from './TestTaker';
import VersionInfo from './VersionInfo';
import './HomePage.css';

const HomePage = () => {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [notesCount, setNotesCount] = useState(0);

  useEffect(() => {
    // Fetch the local questions file
    fetch(process.env.PUBLIC_URL + '/questions.json')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setQuestions(data);
        
        // Count questions with notes
        const notes = JSON.parse(localStorage.getItem('aws-notes') || '{}');
        const questionsWithNotes = data.filter(q => 
          notes[q.id] && notes[q.id].trim()
        );
        setNotesCount(questionsWithNotes.length);
        
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load questions:", err);
        setIsLoading(false);
      });
  }, []);

  const startTest = (num) => {
    // Fisher-Yates shuffle algorithm to get random questions
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, num);
    setSelectedTest(selectedQuestions);
  };

  const startNotesTest = () => {
    // Get only questions that have notes
    const notes = JSON.parse(localStorage.getItem('aws-notes') || '{}');
    const questionsWithNotes = questions.filter(q => 
      notes[q.id] && notes[q.id].trim()
    );
    
    if (questionsWithNotes.length === 0) {
      alert('No tienes notas guardadas aún. Primero completa algunos exámenes y toma notas sobre las preguntas que te resulten difíciles.');
      return;
    }
    
    // Shuffle the questions with notes
    const shuffled = [...questionsWithNotes].sort(() => 0.5 - Math.random());
    setSelectedTest(shuffled);
  };

  if (selectedTest) {
    return <TestTaker questions={selectedTest} />;
  }

  if (isLoading) {
    return <div>Cargando banco de preguntas...</div>;
  }

  return (
    <div className="home-page">
      <h1>Prepárate para tu Examen de AWS</h1>
      <p>Selecciona el número de preguntas para tu simulacro.</p>
      <div className="question-count">
        <strong>Base de datos: {questions.length} preguntas disponibles</strong>
      </div>
      <div className="options-container">
        <button onClick={() => startTest(10)}>Test Rápido (10 preguntas)</button>
        <button onClick={() => startTest(25)}>Test Medio (25 preguntas)</button>
        <button onClick={() => startTest(65)}>Simulacro Completo (65 preguntas)</button>
        <button onClick={() => startTest(100)}>Test Extendido (100 preguntas)</button>
        
        <div className="notes-test-section">
          <button 
            onClick={startNotesTest} 
            className="notes-test-btn"
            disabled={notesCount === 0}
          >
            📝 Repaso de Notas ({notesCount} preguntas)
          </button>
          <p className="notes-test-description">
            {notesCount > 0 
              ? "Practica solo con las preguntas sobre las que has tomado notas" 
              : "Toma notas durante los exámenes para habilitar esta opción"}
          </p>
        </div>
      </div>
      
      <footer className="app-footer">
        <VersionInfo />
      </footer>
    </div>
  );
};

export default HomePage;