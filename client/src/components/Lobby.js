import { io } from "socket.io-client"
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, redirect } from 'react-router-dom'

const socket = io.connect('http://localhost:5000');

function Lobby() {
  const [data, setData] = useState(null);
  const { gamePin } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/active_games/${gamePin}`)
      .then(response => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 404) {
          throw new Error('Game not found');
        } else {
          throw new Error('Error fetching data');
        }
      })
      .then(data => {
        // retrieved data
        console.log(data);
        setData(data)
      })
      .catch(error => {
        console.error(error.message);
      })
    }, [data]);

  // If data exists and number of players match replace current page with game client
  useEffect(() => {
    if (data && data.players_ready === data.num_players) {
      navigate(`/game/${gamePin}`, { replace: true });
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
            <p key={index}>{name}</p>
          ))}
          <button id="rdyButton" onClick={readyUp}>Ready {data.players_ready}/{data.num_players}</button>
        </div>
      )}
    </div>
  );
}

export default Lobby