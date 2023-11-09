import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { io, Socket } from "socket.io-client"
import Home from './components/Home';
import Lobby from './components/Lobby';
import Game from './components/Game';

const socket: Socket = io('http://localhost:5000');

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home socket={socket} />} />
        <Route path="/lobby/:gamePin" element={<Lobby socket={socket} />} />
        <Route path="/game/:gamePin" element={<Game socket={socket} />} />
      </Routes>
    </Router>
  );
}

export default App;
