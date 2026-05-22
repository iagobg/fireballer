import { useState } from 'react';
import './App.css';

import backgroundImg from './assets/background.png';
import fg1Default from './assets/foreground1.png';
import fg2Terrible from './assets/foreground2.png';
import fg3Low from './assets/foreground3.png';
import fg4Moderate from './assets/foreground4.png';
import fg5High from './assets/foreground5.png';
import fg6Immune from './assets/foreground6.png';

const foregroundMap = {
  default: fg1Default,
  terrible: fg2Terrible,
  low: fg3Low,
  moderate: fg4Moderate,
  high: fg5High,
  immune: fg6Immune,
};

function App() {
  const [foreground, setForeground] = useState(foregroundMap.default);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:3000/infer', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.ok && data.predictedClass) {
        const category = data.predictedClass.toLowerCase();
        
        if (foregroundMap[category]) {
          setForeground(foregroundMap[category]);
          setResult(data);
        } else {
          setError(`Received unknown category: ${data.predictedClass}`);
          setForeground(foregroundMap.default);
        }
      } else {
        setError('API response structure invalid or "ok" is false.');
        setForeground(foregroundMap.default);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the inference server.');
      setForeground(foregroundMap.default);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Visual Canvas Area */}
      <div className="canvas-container">
        <img src={backgroundImg} alt="Background" className="layer background-layer" />
        <img src={foreground} alt="Foreground State" className="layer foreground-layer" />
      </div>

      {/* Sidebar Control Panel */}
      <div className="controls-panel">
        <h2>Inference Control</h2>
        
        <label className="upload-btn">
          {loading ? 'Processing...' : 'Upload Image'}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
            disabled={loading} 
            style={{ display: 'none' }}
          />
        </label>

        {error && <div className="error-message">{error}</div>}

        {result && (
          <div className="result-box">
            <h3>Prediction: <span className="highlight">{result.predictedClass}</span></h3>
            <p>Confidence: {(result.confidence * 100).toFixed(2)}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;