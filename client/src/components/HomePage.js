import React, { useState, useEffect } from 'react';
import TestTaker from './TestTaker';
import VersionInfo from './VersionInfo';
import './HomePage.css';

const HomePage = () => {
  const [officialQuestions, setOfficialQuestions] = useState([]);
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [notesCount, setNotesCount] = useState(0);
  const [selectedQuestionSet, setSelectedQuestionSet] = useState('official'); // 'official', 'practice', 'all'

  useEffect(() => {
    // Fetch both question sets
    Promise.all([
      fetch(process.env.PUBLIC_URL + '/questions.json').then(res => res.json()),
      fetch(process.env.PUBLIC_URL + '/practice-questions.json').then(res => res.json())
    ])
      .then(([officialData, practiceData]) => {
        // Add source tags to questions
        const taggedOfficial = officialData.map(q => ({ ...q, source: 'official' }));
        const taggedPractice = practiceData.map(q => ({ ...q, source: 'practice' }));
        
        setOfficialQuestions(taggedOfficial);
        setPracticeQuestions(taggedPractice);
        setAllQuestions([...taggedOfficial, ...taggedPractice]);
        
        // Count questions with notes from all sources
        const notes = JSON.parse(localStorage.getItem('aws-notes') || '{}');
        const allQuestionsData = [...taggedOfficial, ...taggedPractice];
        const questionsWithNotes = allQuestionsData.filter(q => 
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

  // Get current question set based on selection
  const getCurrentQuestions = () => {
    switch(selectedQuestionSet) {
      case 'official': return officialQuestions;
      case 'practice': return practiceQuestions;
      case 'all': return allQuestions;
      default: return officialQuestions;
    }
  };

  const startTest = (num) => {
    const currentQuestions = getCurrentQuestions();
    // Fisher-Yates shuffle algorithm to get random questions
    const shuffled = [...currentQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, num);
    
    // Determine test type based on number of questions and source
    let testType = '';
    const sourceLabel = selectedQuestionSet === 'practice' ? ' (Practice)' : 
                       selectedQuestionSet === 'all' ? ' (Mixto)' : '';
    
    switch(num) {
      case 10: testType = `Test Rápido${sourceLabel}`; break;
      case 25: testType = `Test Medio${sourceLabel}`; break;
      case 65: testType = `Simulacro Completo${sourceLabel}`; break;
      case 100: testType = `Test Extendido${sourceLabel}`; break;
      default: testType = `Test Personalizado${sourceLabel}`;
    }
    
    setSelectedTest({ questions: selectedQuestions, type: testType, isNotesReview: false });
  };

  const startNotesTest = () => {
    // Get only questions that have notes from current selection
    const currentQuestions = getCurrentQuestions();
    const notes = JSON.parse(localStorage.getItem('aws-notes') || '{}');
    const questionsWithNotes = currentQuestions.filter(q => 
      notes[q.id] && notes[q.id].trim()
    );
    
    if (questionsWithNotes.length === 0) {
      const sourceText = selectedQuestionSet === 'practice' ? 'de Practice' : 
                        selectedQuestionSet === 'all' ? 'mixtas' : 'oficiales';
      alert(`No tienes notas guardadas para preguntas ${sourceText}. Primero completa algunos exámenes y toma notas sobre las preguntas que te resulten difíciles.`);
      return;
    }
    
    const sourceLabel = selectedQuestionSet === 'practice' ? ' (Practice)' : 
                       selectedQuestionSet === 'all' ? ' (Mixto)' : '';
    
    setSelectedTest({ questions: questionsWithNotes, type: `Repaso de Notas${sourceLabel}`, isNotesReview: true });
  };  if (selectedTest) {
    return <TestTaker testData={selectedTest} />;
  }

  if (isLoading) {
    return <div>Cargando banco de preguntas...</div>;
  }

  return (
    <div className="home-page">
      <h1>Prepárate para tu Examen de AWS</h1>
      <p>Selecciona el tipo de preguntas y el número de preguntas para tu simulacro.</p>
      
      {/* Selector de tipo de preguntas */}
      <div className="question-set-selector">
        <h3>Tipo de Preguntas:</h3>
        <div className="selector-buttons">
          <button 
            className={`selector-btn ${selectedQuestionSet === 'official' ? 'active' : ''}`}
            onClick={() => setSelectedQuestionSet('official')}
          >
            📋 Oficiales ({officialQuestions.length})
          </button>
          <button 
            className={`selector-btn ${selectedQuestionSet === 'practice' ? 'active' : ''}`}
            onClick={() => setSelectedQuestionSet('practice')}
          >
            🎯 Practice ({practiceQuestions.length})
          </button>
          <button 
            className={`selector-btn ${selectedQuestionSet === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedQuestionSet('all')}
          >
            🔄 Mixto ({allQuestions.length})
          </button>
        </div>
      </div>
      
      <div className="question-count">
        <strong>
          Usando: {getCurrentQuestions().length} preguntas 
          ({selectedQuestionSet === 'official' ? 'Fuente Oficial' : 
            selectedQuestionSet === 'practice' ? 'Curso Practice' : 'Ambas Fuentes'})
        </strong>
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