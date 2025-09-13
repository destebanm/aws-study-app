import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import VersionInfo from './VersionInfo';
import './Dashboard.css';

const getHistory = () => {
    const history = localStorage.getItem('aws-history');
    return history ? JSON.parse(history) : [];
}

const Dashboard = () => {
  const [testHistory, setTestHistory] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [editingNotes, setEditingNotes] = useState({});
  const [tempNotes, setTempNotes] = useState({});

  useEffect(() => {
    const history = getHistory();
    // Sort by date, most recent first
    history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setTestHistory(history);
  }, []);

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const reviewTest = (test) => {
    setSelectedTest(test);
  };

  const closeReview = () => {
    setSelectedTest(null);
    setEditingNotes({});
    setTempNotes({});
  };

  const startEditingNote = (questionId) => {
    const savedNotes = JSON.parse(localStorage.getItem('aws-notes') || '{}');
    setEditingNotes(prev => ({ ...prev, [questionId]: true }));
    setTempNotes(prev => ({ 
      ...prev, 
      [questionId]: savedNotes[questionId] || '' 
    }));
  };

  const cancelEditingNote = (questionId) => {
    setEditingNotes(prev => {
      const newState = { ...prev };
      delete newState[questionId];
      return newState;
    });
    setTempNotes(prev => {
      const newState = { ...prev };
      delete newState[questionId];
      return newState;
    });
  };

  const saveNote = (questionId) => {
    const savedNotes = JSON.parse(localStorage.getItem('aws-notes') || '{}');
    const noteText = tempNotes[questionId]?.trim();
    
    if (noteText) {
      savedNotes[questionId] = noteText;
    } else {
      delete savedNotes[questionId];
    }
    
    localStorage.setItem('aws-notes', JSON.stringify(savedNotes));
    
    // Clear editing state
    setEditingNotes(prev => {
      const newState = { ...prev };
      delete newState[questionId];
      return newState;
    });
    setTempNotes(prev => {
      const newState = { ...prev };
      delete newState[questionId];
      return newState;
    });
  };

  const updateTempNote = (questionId, value) => {
    setTempNotes(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateStats = () => {
    if (testHistory.length === 0) return null;

    const stats = {
      totalTests: testHistory.length,
      averageScore: testHistory.reduce((acc, test) => acc + test.score, 0) / testHistory.length,
      bestScore: Math.max(...testHistory.map(test => test.score)),
      passedTests: testHistory.filter(test => test.score >= 72).length,
      totalQuestions: testHistory.reduce((acc, test) => acc + test.numberOfQuestions, 0),
      notesReviewTests: testHistory.filter(test => test.isNotesReview).length
    };
    return stats;
  };

  const stats = calculateStats();

  if (selectedTest) {
    return (
      <div className="test-review-container">
        <div className="review-header">
          <button onClick={closeReview} className="back-btn">← Back to History</button>
          <h2>Exam Review</h2>
          <div className="test-info">
            <span>Date: {format(new Date(selectedTest.createdAt), "MMMM d, yyyy, HH:mm", { locale: enUS })}</span>
            <span>
              Type: {selectedTest.testType || (selectedTest.isNotesReview ? 'Notes Review' : 'Regular Test')}
            </span>
            <span>Score: {selectedTest.score.toFixed(2)}%</span>
            <span>Time: {formatTime(selectedTest.timeInSeconds)}</span>
          </div>
        </div>
        <div className="review-results">
          {selectedTest.results.map((result, index) => {
            const savedNotes = JSON.parse(localStorage.getItem('aws-notes') || '{}');
            const hasNote = savedNotes[result.id];
            const isEditing = editingNotes[result.id];
            
            return (
              <div key={result.id} className={`result-card ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                <h4>{index + 1}. {result.questionText}</h4>
                <p><strong>Your answer:</strong> {result.selectedOptionIndex !== undefined ? result.options[result.selectedOptionIndex].text : 'Not answered'} <span className={result.isCorrect ? 'correct-text' : 'incorrect-text'}>({result.isCorrect ? 'Correct' : 'Incorrect'})</span></p>
                {!result.isCorrect && (
                  <p><strong>Correct answer:</strong> {result.options.find(o => o.isCorrect).text}</p>
                )}
                <p className="explanation"><strong>Explanation:</strong> {result.explanation}</p>
                
                <div className="notes-section">
                  <div className="notes-header">
                    <strong>📝 My Notes:</strong>
                    {!isEditing && (
                      <button 
                        className="edit-note-btn"
                        onClick={() => startEditingNote(result.id)}
                        title={hasNote ? "Edit note" : "Add note"}
                      >
                        {hasNote ? "✏️ Edit" : "➕ Add Note"}
                      </button>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="note-editor">
                      <textarea
                        value={tempNotes[result.id] || ''}
                        onChange={(e) => updateTempNote(result.id, e.target.value)}
                        placeholder="Write your notes about this question here..."
                        rows="3"
                        className="note-textarea"
                      />
                      <div className="note-actions">
                        <button 
                          className="save-note-btn"
                          onClick={() => saveNote(result.id)}
                        >
                          💾 Save
                        </button>
                        <button 
                          className="cancel-note-btn"
                          onClick={() => cancelEditingNote(result.id)}
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </div>
                  ) : hasNote ? (
                    <div className="saved-note">
                      <p>{hasNote}</p>
                    </div>
                  ) : (
                    <p className="no-note">You have no notes for this question</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2>My Exam History</h2>
      {testHistory.length === 0 ? (
        <p>You haven't completed any exams yet. Start a new one to see your progress!</p>
      ) : (
        <>
          <div className="stats-container">
            <div className="stat-card">
              <h3>Tests Completed</h3>
              <p>{stats.totalTests}</p>
            </div>
            <div className="stat-card">
              <h3>Average Score</h3>
              <p>{stats.averageScore.toFixed(2)}%</p>
            </div>
            <div className="stat-card">
              <h3>Best Score</h3>
              <p>{stats.bestScore.toFixed(2)}%</p>
            </div>
            <div className="stat-card">
              <h3>Tests Passed</h3>
              <p>{stats.passedTests} of {stats.totalTests}</p>
            </div>
            <div className="stat-card">
              <h3>Total Questions</h3>
              <p>{stats.totalQuestions}</p>
            </div>
            <div className="stat-card">
              <h3>Notes Reviews</h3>
              <p>{stats.notesReviewTests}</p>
            </div>
          </div>
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Questions</th>
                <th>Time</th>
                <th>Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testHistory.map(test => (
                <tr key={test._id}>
                  <td>{format(new Date(test.createdAt), "MMM d, yyyy, HH:mm", { locale: enUS })}</td>
                  <td className="center-text">
                    <span className={`test-type ${test.isNotesReview ? 'notes-review' : 'regular'}`}>
                      {test.testType || (test.isNotesReview ? 'Notes Review' : 'Regular Test')}
                    </span>
                  </td>
                  <td className="center-text">{test.numberOfQuestions}</td>
                  <td className="center-text">{formatTime(test.timeInSeconds)}</td>
                  <td className={`center-text score ${test.score >= 72 ? 'pass' : 'fail'}`}>{test.score.toFixed(2)}%</td>
                  <td className="center-text"><button onClick={() => reviewTest(test)}>Review</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      
      <footer className="app-footer">
        <VersionInfo />
      </footer>
    </div>
  );
};

export default Dashboard;