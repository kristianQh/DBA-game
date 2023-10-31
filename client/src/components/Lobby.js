import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function Lobby(props) {
  const {socket} = props;
  const [data, setData] = useState(null);
  const { gamePin } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('update_playerdata', (playerData) => {
      console.log(playerData)
      setData(playerData)
    });
  }, [socket]);

  // If data exists and number of players match replace current page with game client
  useEffect(() => {
    if (data && data.players_ready === data.num_players) {
      navigate(`/game/${gamePin}`, { replace: true });
      socket.emit('game_starting', { pin : gamePin })
    }
  }, [data]);

  const readyUp = () => {
    document.getElementById("rdyButton").disabled = true;
    socket.emit('ready', { pin: gamePin })
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
          {data.players.map((name, index) => (
            // (key : [name, sid])
            <p key={index}>{name[0]}</p>
          ))}
          <button id="rdyButton" onClick={readyUp}>Ready {data.players_ready}/{data.num_players}</button>
        </div>
      )}
    </div>
  );
}

export default Lobby