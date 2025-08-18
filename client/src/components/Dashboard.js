import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './Dashboard.css';

const getHistory = () => {
    const history = localStorage.getItem('aws-history');
    return history ? JSON.parse(history) : [];
}

const Dashboard = () => {
  const [testHistory, setTestHistory] = useState([]);

  useEffect(() => {
    const history = getHistory();
    // Sort by date, most recent first
    history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setTestHistory(history);
  }, []);

  const calculateStats = () => {
    if (testHistory.length === 0) return null;

    const stats = {
      totalTests: testHistory.length,
      averageScore: testHistory.reduce((acc, test) => acc + test.score, 0) / testHistory.length,
      bestScore: Math.max(...testHistory.map(test => test.score)),
      passedTests: testHistory.filter(test => test.score >= 72).length,
      totalQuestions: testHistory.reduce((acc, test) => acc + test.numberOfQuestions, 0)
    };
    return stats;
  };

  const stats = calculateStats();

  return (
    <div className="dashboard-container">
      <h2>Mi Historial de Exámenes</h2>
      {testHistory.length === 0 ? (
        <p>Aún no has completado ningún examen. ¡Empieza uno nuevo para ver tu progreso!</p>
      ) : (
        <>
          <div className="stats-container">
            <div className="stat-card">
              <h3>Tests Completados</h3>
              <p>{stats.totalTests}</p>
            </div>
            <div className="stat-card">
              <h3>Puntuación Media</h3>
              <p>{stats.averageScore.toFixed(2)}%</p>
            </div>
            <div className="stat-card">
              <h3>Mejor Puntuación</h3>
              <p>{stats.bestScore.toFixed(2)}%</p>
            </div>
            <div className="stat-card">
              <h3>Tests Aprobados</h3>
              <p>{stats.passedTests} de {stats.totalTests}</p>
            </div>
            <div className="stat-card">
              <h3>Total Preguntas</h3>
              <p>{stats.totalQuestions}</p>
            </div>
          </div>
          <table className="history-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Nº Preguntas</th>
                <th>Puntuación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {testHistory.map(test => (
                <tr key={test._id}>
                  <td>{format(new Date(test.createdAt), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}</td>
                  <td className="center-text">{test.numberOfQuestions}</td>
                  <td className={`center-text score ${test.score >= 72 ? 'pass' : 'fail'}`}>{test.score.toFixed(2)}%</td>
                  <td className="center-text"><button onClick={() => alert(`Próximamente: Revisar test ${test._id}`)}>Revisar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Dashboard;