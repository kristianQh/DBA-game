import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

function Lobby() {
  const [data, setData] = useState(null);
  const { gamePin } = useParams();

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
        setData(data)
        console.log(data);
      })
      .catch(error => {
        console.error(error.message);
      })
    });

  return (
    <div>
      <h1>Lobby for Game {gamePin}</h1>
      {/* If no data, just load */}
      {(data === null) ? (
        <p>Loading...</p>
      ) : (
        data.map(name => (
          <p>{name}</p>
        ))
      )}
    </div>
  )
}

export default Lobby