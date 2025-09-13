import React, { useState, useEffect } from 'react';
import './TestTaker.css';

// Helper functions to interact with localStorage
const getNotes = () => JSON.parse(localStorage.getItem('aws-notes') || '{}');
const saveNotes = (notes) => localStorage.setItem('aws-notes', JSON.stringify(notes));
const getHistory = () => JSON.parse(localStorage.getItem('aws-history') || '[]');
const saveHistory = (history) => localStorage.setItem('aws-history', JSON.stringify(history));

const QuestionDisplay = ({ question, onAnswer, onNoteChange, note, userAnswerIndex }) => {
  return (
    <div className="question-container">
      <h3>{question.questionText}</h3>
      <form className="options-form">
        {question.options.map((option, index) => (
          <div key={index} className="option">
            <input
              type="radio"
              name={`question_${question.id}`}
              id={`option_${question.id}_${index}`}
              checked={userAnswerIndex === index}
              onChange={() => onAnswer(question.id, index)}
            />
            <label htmlFor={`option_${question.id}_${index}`}>{option.text}</label>
          </div>
        ))}
      </form>
      <div className="notes-container">
        <textarea
          placeholder="Tus notas sobre esta pregunta..."
          value={note}
          onChange={(e) => onNoteChange(question.id, e.target.value)}
          rows="4"
        />
      </div>
    </div>
  );
};

const ResultsDisplay = ({ results, score, onRestart }) => {
  return (
    <div className="results-container">
      <h2>Resultados del Examen</h2>
      <h3 className={score >= 72 ? 'pass' : 'fail'}>Puntuación Final: {score.toFixed(2)}%</h3>
      <button onClick={onRestart} className="restart-btn">Hacer otro test</button>
      {results.map((result, index) => (
        <div key={result.id} className={`result-card ${result.isCorrect ? 'correct' : 'incorrect'}`}>
          <h4>{index + 1}. {result.questionText}</h4>
          <p><strong>Tu respuesta:</strong> {result.selectedOptionIndex !== undefined ? result.options[result.selectedOptionIndex].text : 'No contestada'} <span className={result.isCorrect ? 'correct-text' : 'incorrect-text'}>({result.isCorrect ? 'Correcta' : 'Incorrecta'})</span></p>
          {!result.isCorrect && (
            <p><strong>Respuesta correcta:</strong> {result.options.find(o => o.isCorrect).text}</p>
          )}
          <p className="explanation"><strong>Explicación:</strong> {result.explanation}</p>
        </div>
      ))}
    </div>
  );
};

const TestTaker = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [notes, setNotes] = useState(getNotes());
  const [isFinished, setIsFinished] = useState(false);
  const [finalResults, setFinalResults] = useState(null);
  const [startTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Check if this is a notes review test
  const isNotesReviewTest = questions.every(q => notes[q.id] && notes[q.id].trim());

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((new Date() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Format time display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId, optionIndex) => {
    setUserAnswers({ ...userAnswers, [questionId]: optionIndex });
  };

  const handleNoteChange = (questionId, text) => {
    const newNotes = { ...notes, [questionId]: text };
    setNotes(newNotes);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (window.confirm('¿Estás seguro de que quieres finalizar el examen?')) {
      const endTime = new Date();
      const totalTimeInSeconds = Math.floor((endTime - startTime) / 1000);
      
      // 1. Grade the test
      let correctAnswersCount = 0;
      const results = questions.map(q => {
        const userAnswerIndex = userAnswers[q.id];
        const isCorrect = (userAnswerIndex !== undefined) && q.options[userAnswerIndex]?.isCorrect;
        if (isCorrect) {
          correctAnswersCount++;
        }
        return {
          ...q,
          selectedOptionIndex: userAnswerIndex,
          isCorrect: isCorrect || false,
        };
      });
      const score = (correctAnswersCount / questions.length) * 100;

      // 2. Save notes to localStorage
      saveNotes(notes);

      // 3. Save test result to history in localStorage
      const history = getHistory();
      const newTestResult = {
        _id: new Date().toISOString(), // Unique ID for the test
        createdAt: new Date(),
        score,
        numberOfQuestions: questions.length,
        timeInSeconds: totalTimeInSeconds,
        isNotesReview: isNotesReviewTest,
        results, // Save full results for review
        notes: Object.keys(notes).reduce((acc, questionId) => {
          if (notes[questionId] && notes[questionId].trim()) {
            acc[questionId] = notes[questionId];
          }
          return acc;
        }, {})
      };
      saveHistory([...history, newTestResult]);

      // 4. Update state to show results
      setFinalResults({ results, score });
      setIsFinished(true);
    }
  };
  
  const handleRestart = () => {
      window.location.reload();
  }

  if (isFinished && finalResults) {
    return <ResultsDisplay results={finalResults.results} score={finalResults.score} onRestart={handleRestart} />;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="test-taker-container">
      <div className="test-header">
        <div className="test-title">
          <h2>{isNotesReviewTest ? '📝 Repaso de Notas' : 'Simulacro de Examen'}</h2>
          {isNotesReviewTest && (
            <p className="notes-review-subtitle">
              Practicando con preguntas que tenían notas guardadas
            </p>
          )}
        </div>
        <div className="test-info">
          <div className="progress-indicator">Pregunta {currentQuestionIndex + 1} de {questions.length}</div>
          <div className="timer">⏱️ {formatTime(elapsedTime)}</div>
        </div>
      </div>
      <QuestionDisplay
        question={currentQuestion}
        onAnswer={handleAnswer}
        onNoteChange={handleNoteChange}
        note={notes[currentQuestion.id] || ''}
        userAnswerIndex={userAnswers[currentQuestion.id]}
      />
      <div className="navigation-buttons">
        <button onClick={handlePrevious} disabled={currentQuestionIndex === 0}>Anterior</button>
        {currentQuestionIndex === questions.length - 1
          ? <button onClick={handleSubmit} className="finish-btn">Finalizar Examen</button>
          : <button onClick={handleNext}>Siguiente</button>}
      </div>
    </div>
  );
};

export default TestTaker;