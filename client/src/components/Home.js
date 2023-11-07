import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home(props) {
  const {socket} = props;
  const [playerName, setPlayerName] = useState("");
  const [gamePin, setGamePin] = useState("");
  const navigate = useNavigate();

  const joinLobby = (event) => {
    // Wait on asynchronous socket communication
    event.preventDefault();
    socket.emit('exists', { pin: gamePin, name: playerName });

    socket.on('exists', (exists) => {
      if (exists) {
        socket.emit('join', { pin: gamePin, name: playerName });
        navigate(`/lobby/${gamePin}`)
      } else {
        alert('Invalid game pin')
      }
    })
  };

  const createLobby = () => {
    socket.emit('create', { name: playerName });
    socket.on('create', ( gamePin ) => {
      if (gamePin !== 0) {
        navigate(`/lobby/${gamePin}`)
      }
    })
  };

  return (
    <div className="App">
      <button onClick={createLobby}>Create Lobby</button>
      <form onSubmit={joinLobby}>
        <input
          type="text"
          placeholder='Player Name'
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <input
          type="text"
          placeholder='Game PIN'
          value={gamePin}
          onChange={(e) => setGamePin(e.target.value)}
        />
        <button type="submit">Join Lobby</button>
      </form>
    </div>
  );
}

export default Home;
