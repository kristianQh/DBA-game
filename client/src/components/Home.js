import { io } from "socket.io-client"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const socket = io.connect('http://localhost:5000');

function Home() {
  const [socketInstance, setSocketInstance] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [gamePin, setGamePin] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');

      return () => {
        socket.disconnect()
      }

    });
  }, []);

  const joinLobby = (event) => {
    event.preventDefault();
    socket.emit('exists', { room: gamePin, name: playerName });

    socket.on('exists', (exists) => {
      if (exists) {
        socket.emit('join', { room: gamePin, name: playerName });
        navigate(`/lobby/${gamePin}`)
      } else {
        alert('Invalid game pin')
      }
    })
  };

  // socket.on('exists', function(exists) {
  //   if(exists) {
  //     alert("Joined")
  //   }
  //   else {
  //     alert("That game doesnt exist")
  //   }
  // })

  const createLobby = () => {

    socket.emit('create', { room: gamePin, name: playerName });
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
