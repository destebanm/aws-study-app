import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink
} from 'react-router-dom';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import NotesReview from './components/NotesReview';
import './App.css';

function App() {
  return (
    <Router basename="/aws-study-app">
      <div className="App">
        <nav className="main-nav">
          <NavLink to="/" end>New Test</NavLink>
          <NavLink to="/history">History</NavLink>
          <NavLink to="/notes">My Notes</NavLink>
        </nav>
        <main className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/history" element={<Dashboard />} />
            <Route path="/notes" element={<NotesReview />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
