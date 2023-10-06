import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Lobby from './components/Lobby';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/lobby/:gamePin" element={<Lobby/>} />
      </Routes>
    </Router>
  );
}

export default App;
