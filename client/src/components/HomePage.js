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
                       selectedQuestionSet === 'all' ? ' (Mixed)' : '';
    
    switch(num) {
      case 10: testType = `Quick Test${sourceLabel}`; break;
      case 25: testType = `Medium Test${sourceLabel}`; break;
      case 65: testType = `Full Exam${sourceLabel}`; break;
      case 100: testType = `Extended Test${sourceLabel}`; break;
      default: testType = `Custom Test${sourceLabel}`;
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
      const sourceText = selectedQuestionSet === 'practice' ? 'Practice' : 
                        selectedQuestionSet === 'all' ? 'mixed' : 'official';
      alert(`You don't have any saved notes for ${sourceText} questions. First complete some exams and take notes on questions you find difficult.`);
      return;
    }
    
    const sourceLabel = selectedQuestionSet === 'practice' ? ' (Practice)' : 
                       selectedQuestionSet === 'all' ? ' (Mixed)' : '';
    
    setSelectedTest({ questions: questionsWithNotes, type: `Notes Review${sourceLabel}`, isNotesReview: true });
  };  if (selectedTest) {
    return <TestTaker testData={selectedTest} />;
  }

  if (isLoading) {
    return <div>Loading question bank...</div>;
  }

  return (
    <div className="home-page">
      <h1>Prepare for your AWS Exam</h1>
      <p>Select the question type and number of questions for your practice exam.</p>
      
      {/* Question type selector */}
      <div className="question-set-selector">
        <h3>Question Type:</h3>
        <div className="selector-buttons">
          <button 
            className={`selector-btn ${selectedQuestionSet === 'official' ? 'active' : ''}`}
            onClick={() => setSelectedQuestionSet('official')}
          >
            📋 Official ({officialQuestions.length})
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
            🔄 Mixed ({allQuestions.length})
          </button>
        </div>
      </div>
      
      <div className="question-count">
        <strong>
          Using: {getCurrentQuestions().length} questions 
          ({selectedQuestionSet === 'official' ? 'Official Source' : 
            selectedQuestionSet === 'practice' ? 'Practice Course' : 'Both Sources'})
        </strong>
      </div>
      
      <div className="options-container">
        <button onClick={() => startTest(10)}>Quick Test (10 questions)</button>
        <button onClick={() => startTest(25)}>Medium Test (25 questions)</button>
        <button onClick={() => startTest(65)}>Full Exam (65 questions)</button>
        <button onClick={() => startTest(100)}>Extended Test (100 questions)</button>
        
        <div className="notes-test-section">
          <button 
            onClick={startNotesTest} 
            className="notes-test-btn"
            disabled={notesCount === 0}
          >
            📝 Notes Review ({notesCount} questions)
          </button>
          <p className="notes-test-description">
            {notesCount > 0 
              ? "Practice only with questions you've taken notes on" 
              : "Take notes during exams to enable this option"}
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