import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Lobby from './components/Lobby';
import Game from './components/Game';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/lobby/:gamePin" element={<Lobby/>} />
        <Route path="/game/:gamePin" element={<Game/>} />
      </Routes>
    </Router>
  );
}

export default App;
