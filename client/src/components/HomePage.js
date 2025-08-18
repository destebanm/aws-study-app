import React, { useState, useEffect } from 'react';
import TestTaker from './TestTaker';
import './HomePage.css';

const HomePage = () => {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);

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
      <div className="options-container">
        <button onClick={() => startTest(10)}>Test Rápido (10 preguntas)</button>
        <button onClick={() => startTest(25)}>Test Medio (25 preguntas)</button>
        <button onClick={() => startTest(65)}>Simulacro Completo (65 preguntas)</button>
        <button onClick={() => startTest(100)}>Test Extendido (100 preguntas)</button>
      </div>
    </div>
  );
};

export default HomePage;