import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

type PlayerData = any;

interface LobbyProps {
  socket: Socket;
}

function Lobby({ socket }: LobbyProps) {
  const [data, setData] = useState<PlayerData | null>(null);
  const { gamePin } = useParams<{ gamePin: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('update_playerdata', (playerData: PlayerData) => {
      console.log(playerData);
      setData(playerData);
    });

    // Clean up the event listeners when the component unmounts
    return () => {
      socket.off('update_playerdata');
    };
  }, [socket]);

  // If data exists and number of players match replace current page with game client
  useEffect(() => {
    if (data && data.players_ready === data.num_players) {
      navigate(`/game/${gamePin}`, { replace: true });
      socket.emit('game_starting', { pin: gamePin });
    }
  }, [data, gamePin, navigate, socket]);

  const readyUp = () => {
    const rdyButton = document.getElementById('rdyButton');
    if (rdyButton) {
      rdyButton.setAttribute('disabled', 'true');
    }
    socket.emit('ready', { pin: gamePin });
  };

  return (
    <div>
      <h1>Lobby for Game {gamePin}</h1>
      {
      // If no data just load
      data === null ? (
        <p>Loading...</p>
      ) : (
        <div>
          {data.players.map((name: string, index: number) => (
            // (key : [name, sid])
            <p key={index}>{name[0]}</p>
          ))}
          <button id="rdyButton" onClick={readyUp}>Ready {data.players_ready}/{data.num_players}</button>
        </div>
      )}
    </div>
  );
}

export default Lobby;