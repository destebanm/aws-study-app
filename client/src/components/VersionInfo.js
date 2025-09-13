import React from 'react';
import { VERSION_INFO } from '../version';
import './VersionInfo.css';

const VersionInfo = () => {
  return (
    <div className="version-container">
      <span className="version-badge">
        {VERSION_INFO?.version || 'v1.0.0'}
      </span>
    </div>
  );
};

export default VersionInfo;