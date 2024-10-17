import logo from './logo.svg';
import './App.css';
import SimpleAudioTranscription from './components/SimpleAudioTranscription';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Audio Transcription</h1>
        <SimpleAudioTranscription />
      </header>
    </div>
  );
}

export default App;
