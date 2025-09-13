import React, { useState } from 'react';
import { VERSION_INFO } from '../version';
import './VersionInfo.css';

const VersionInfo = () => {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const getCommitShort = () => {
    if (VERSION_INFO?.gitCommit === 'local') return 'Local';
    return VERSION_INFO?.gitCommit?.substring(0, 7) || 'Unknown';
  };

  return (
    <div className="version-container">
      <div className="version-info">
        <span className="version-badge" onClick={toggleDetails} title="Click para más detalles">
          {VERSION_INFO?.version || 'v1.0.0'}
        </span>
        <span className="build-date">
          {VERSION_INFO?.buildDate || 'Desarrollo local'}
        </span>
      </div>
      
      {showDetails && (
        <div className="version-modal-overlay" onClick={toggleDetails}>
          <div className="version-modal" onClick={(e) => e.stopPropagation()}>
            <div className="version-modal-header">
              <h3>🚀 Información de la Aplicación</h3>
              <button className="close-btn" onClick={toggleDetails}>×</button>
            </div>
            
            <div className="version-modal-content">
              <div className="info-row">
                <span className="info-label">📦 Versión:</span>
                <span className="info-value">{VERSION_INFO?.version || 'v1.0.0'}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">📅 Fecha de Build:</span>
                <span className="info-value">{VERSION_INFO?.buildDate || 'Desarrollo local'}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">🌍 Entorno:</span>
                <span className={`info-value env-${VERSION_INFO?.buildEnv}`}>
                  {VERSION_INFO?.buildEnv === 'production' ? '🟢 Producción' : '🟡 Desarrollo'}
                </span>
              </div>
              
              <div className="info-row">
                <span className="info-label">🔗 Commit:</span>
                <span className="info-value commit-hash">{getCommitShort()}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">⏰ Timestamp:</span>
                <span className="info-value timestamp">{VERSION_INFO?.buildTimestamp || 'N/A'}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">🌐 Deploy URL:</span>
                <a 
                  href={VERSION_INFO?.deployUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="info-value link"
                >
                  {VERSION_INFO?.deployUrl}
                </a>
              </div>
            </div>
            
            <div className="version-modal-footer">
              <p>🎯 AWS Solutions Architect Associate Study App</p>
              <p>📚 300 preguntas oficiales con explicaciones detalladas</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionInfo;