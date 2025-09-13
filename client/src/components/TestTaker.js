import React, { useState, useEffect } from 'react';
import './TestTaker.css';

// Helper functions to interact with localStorage
const getNotes = () => JSON.parse(localStorage.getItem('aws-notes') || '{}');
const saveNotes = (notes) => localStorage.setItem('aws-notes', JSON.stringify(notes));
const getHistory = () => JSON.parse(localStorage.getItem('aws-history') || '[]');
const saveHistory = (history) => localStorage.setItem('aws-history', JSON.stringify(history));

// Helper function to detect if a question is multi-select
const isMultiSelectQuestion = (question) => {
  const text = question.questionText.toLowerCase();
  return text.includes('(select two)') || 
         text.includes('(select three)') || 
         text.includes('(select 2)') ||
         text.includes('(select 3)') ||
         text.includes('select two') ||
         text.includes('select three') ||
         question.options.filter(option => option.isCorrect).length > 1;
};

// Helper function to get number of correct answers needed
const getRequiredAnswers = (question) => {
  const text = question.questionText.toLowerCase();
  if (text.includes('(select two)') || text.includes('(select 2)') || text.includes('select two')) {
    return 2;
  }
  if (text.includes('(select three)') || text.includes('(select 3)') || text.includes('select three')) {
    return 3;
  }
  // Fallback: count actual correct answers
  return question.options.filter(option => option.isCorrect).length;
};

const QuestionDisplay = ({ question, onAnswer, onNoteChange, note, userAnswerIndex, userAnswers }) => {
  const isMultiSelect = isMultiSelectQuestion(question);
  const requiredAnswers = isMultiSelect ? getRequiredAnswers(question) : 1;
  const currentAnswers = isMultiSelect ? (userAnswers || []) : [];
  
  const handleOptionChange = (index) => {
    if (isMultiSelect) {
      const newAnswers = currentAnswers.includes(index) 
        ? currentAnswers.filter(i => i !== index)
        : [...currentAnswers, index];
      onAnswer(question.id, newAnswers);
    } else {
      onAnswer(question.id, index);
    }
  };

  return (
    <div className="question-container">
      <h3>{question.questionText}</h3>
      {isMultiSelect && (
        <div className="multi-select-info">
          <p><strong>Select {requiredAnswers} answer{requiredAnswers > 1 ? 's' : ''}:</strong></p>
        </div>
      )}
      <form className="options-form">
        {question.options.map((option, index) => (
          <div key={index} className="option">
            <input
              type={isMultiSelect ? "checkbox" : "radio"}
              name={`question_${question.id}`}
              id={`option_${question.id}_${index}`}
              checked={isMultiSelect ? currentAnswers.includes(index) : userAnswerIndex === index}
              onChange={() => handleOptionChange(index)}
            />
            <label htmlFor={`option_${question.id}_${index}`}>{option.text}</label>
          </div>
        ))}
      </form>
      {isMultiSelect && (
        <div className="selection-counter">
          <p>Selected: {currentAnswers.length} of {requiredAnswers}</p>
        </div>
      )}
      <div className="notes-container">
        <textarea
          placeholder="Your notes about this question..."
          value={note}
          onChange={(e) => onNoteChange(question.id, e.target.value)}
          rows="4"
        />
      </div>
    </div>
  );
};

const ResultsDisplay = ({ results, score, onRestart }) => {
  const renderUserAnswers = (result) => {
    const isMultiSelect = isMultiSelectQuestion(result);
    
    if (isMultiSelect) {
      const selectedIndices = Array.isArray(result.selectedOptionIndices) ? result.selectedOptionIndices : [];
      if (selectedIndices.length === 0) {
        return 'Not answered';
      }
      return selectedIndices.map(index => result.options[index]?.text).join(', ');
    } else {
      const selectedIndex = result.selectedOptionIndex;
      return selectedIndex !== undefined ? result.options[selectedIndex]?.text : 'Not answered';
    }
  };

  const renderCorrectAnswers = (result) => {
    const correctOptions = result.options.filter(option => option.isCorrect);
    return correctOptions.map(option => option.text).join(', ');
  };

  return (
    <div className="results-container">
      <h2>Exam Results</h2>
      <h3 className={score >= 72 ? 'pass' : 'fail'}>Final Score: {score.toFixed(2)}%</h3>
      <button onClick={onRestart} className="restart-btn">Take another test</button>
      {results.map((result, index) => (
        <div key={result.id} className={`result-card ${result.isCorrect ? 'correct' : 'incorrect'}`}>
          <h4>{index + 1}. {result.questionText}</h4>
          <p><strong>Your answer{isMultiSelectQuestion(result) ? 's' : ''}:</strong> {renderUserAnswers(result)} <span className={result.isCorrect ? 'correct-text' : 'incorrect-text'}>({result.isCorrect ? 'Correct' : 'Incorrect'})</span></p>
          {!result.isCorrect && (
            <p><strong>Correct answer{result.options.filter(o => o.isCorrect).length > 1 ? 's' : ''}:</strong> {renderCorrectAnswers(result)}</p>
          )}
          <p className="explanation"><strong>Explanation:</strong> {result.explanation}</p>
        </div>
      ))}
    </div>
  );
};

const TestTaker = ({ testData }) => {
  // Extract data from testData object
  const questions = testData.questions || testData; // Backward compatibility
  const testType = testData.type || 'Regular Test';
  const isNotesReview = testData.isNotesReview || false;
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [notes, setNotes] = useState(getNotes());
  const [isFinished, setIsFinished] = useState(false);
  const [finalResults, setFinalResults] = useState(null);
  const [startTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Use testType instead of detecting from notes
  const isNotesReviewTest = isNotesReview;

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

  const handleAnswer = (questionId, optionIndexOrIndices) => {
    setUserAnswers({ ...userAnswers, [questionId]: optionIndexOrIndices });
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

  const evaluateAnswer = (question, userAnswer) => {
    const isMultiSelect = isMultiSelectQuestion(question);
    
    if (isMultiSelect) {
      const userIndices = Array.isArray(userAnswer) ? userAnswer : [];
      const correctIndices = question.options
        .map((option, index) => option.isCorrect ? index : null)
        .filter(index => index !== null);
      
      // Check if user selected exactly the right answers
      if (userIndices.length !== correctIndices.length) {
        return false;
      }
      
      // Check if all selected answers are correct and all correct answers are selected
      return userIndices.every(index => correctIndices.includes(index)) &&
             correctIndices.every(index => userIndices.includes(index));
    } else {
      // Single select question
      return userAnswer !== undefined && question.options[userAnswer]?.isCorrect;
    }
  };

  const handleSubmit = () => {
    if (window.confirm('Are you sure you want to finish the exam?')) {
      const endTime = new Date();
      const totalTimeInSeconds = Math.floor((endTime - startTime) / 1000);
      
      // 1. Grade the test
      let correctAnswersCount = 0;
      const results = questions.map(q => {
        const userAnswer = userAnswers[q.id];
        const isCorrect = evaluateAnswer(q, userAnswer);
        if (isCorrect) {
          correctAnswersCount++;
        }
        
        const isMultiSelect = isMultiSelectQuestion(q);
        return {
          ...q,
          selectedOptionIndex: isMultiSelect ? undefined : userAnswer,
          selectedOptionIndices: isMultiSelect ? (Array.isArray(userAnswer) ? userAnswer : []) : undefined,
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
        testType: testType, // Add test type information
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
                    <h2>{testType}</h2>
          {isNotesReviewTest && (
            <p className="notes-review-subtitle">Questions with your saved notes</p>
          )}
        </div>
        <div className="test-info">
          <div className="progress-indicator">Question {currentQuestionIndex + 1} of {questions.length}</div>
          <div className="timer">⏱️ {formatTime(elapsedTime)}</div>
        </div>
      </div>
      <QuestionDisplay
        question={currentQuestion}
        onAnswer={handleAnswer}
        onNoteChange={handleNoteChange}
        note={notes[currentQuestion.id] || ''}
        userAnswerIndex={userAnswers[currentQuestion.id]}
        userAnswers={userAnswers[currentQuestion.id]}
      />
      <div className="navigation-buttons">
        <button onClick={handlePrevious} disabled={currentQuestionIndex === 0}>Previous</button>
        {currentQuestionIndex === questions.length - 1
          ? <button onClick={handleSubmit} className="finish-btn">Finish Exam</button>
          : <button onClick={handleNext}>Next</button>}
      </div>
    </div>
  );
};

export default TestTaker;