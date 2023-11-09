import { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";

type HomeProps = {
  socket: Socket;
};

function Home({ socket }: HomeProps) {
  const [playerName, setPlayerName] = useState<string>("");
  const [gamePin, setGamePin] = useState<string>("");
  const navigate = useNavigate();

  const joinLobby = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    socket.emit('exists', { pin: gamePin, name: playerName });

    socket.on('exists', (exists: boolean) => {
      if (exists) {
        socket.emit('join', { pin: gamePin, name: playerName });
        navigate(`/lobby/${gamePin}`);
      } else {
        alert('Invalid game pin');
      }
    });
  };

  const createLobby = () => {
    socket.emit('create', { name: playerName });
    socket.on('create', (gamePin: string) => {
      if (gamePin !== '0') {
        navigate(`/lobby/${gamePin}`);
      }
    });
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
