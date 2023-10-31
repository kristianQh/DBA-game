import React, { useState, useEffect } from 'react'

function Game(props) {
  const { socket } = props;
  const [articleURL, setArticleURL] = useState('');
  const [scrapedData, setScrapedData] = useState(null);
  const [currentPlayerSid, setCurrentPlayerSid] = useState(null);
  const [playerSid, setPlayerSid] = useState(null);
  const [gamePin, setGamePin] = useState("");

  useEffect(() => {
    socket.on('player_turn', (data) => {
      const { current_player_sid, game_pin } = data
      setGamePin(game_pin)
      setCurrentPlayerSid(current_player_sid)
    });
    socket.on('set_client_sid', (data) => {
      const { player_sid } = data
      setPlayerSid(player_sid)
      console.log(playerSid)
    });
  }, [socket]);

  const retrieveLink = (event) => {
    // Wait on scrapper
    event.preventDefault();
    socket.emit('scrape', { url: articleURL });

    socket.on('scraped_data', (data) => {
      setScrapedData(data);
      console.log(data)
    })
  };

  const confirmInput = () => {
    document.getElementById("rdyButton").disabled = true;
    socket.emit('confirm_price', { pin: gamePin })
  };

  return (
    <div>
      <h1>Game</h1>
      {currentPlayerSid === playerSid && playerSid !== null ? (
        <form onSubmit={retrieveLink}>
          <input
            type="text"
            placeholder='DBA Article Link'
            value={articleURL}
            onChange={(e) => setArticleURL(e.target.value)}
          />
          <input type="submit" value="Submit" />
        </form>
      ) : ("")}
      {scrapedData && (
        <div>
          <h2>Scraped data</h2>
          <h3>{scrapedData["title"]}</h3>
          <p>{scrapedData["description"]}</p>
          <img src={scrapedData["image_urls"][1]} alt="text"></img>
        </div>
      )}
      <button id="rdyButton" onClick={confirmInput}>Test button</button>
    </div>

  )
}

export default Game