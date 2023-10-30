import React, { useState, useEffect } from 'react'

function Game(props) {
  const { socket } = props;
  const [articleURL, setArticleURL] = useState('');
  const [scrapedData, setScrapedData] = useState(null);
  const [currentPlayerSid, setCurrentPlayerSid] = useState(null);
  const [playerSid, setPlayerSid] = useState(null);

  useEffect(() => {
    socket.on('player_turn', (data) => {
      const { current_player_sid, player_sid } = data
      setPlayerSid(player_sid)
      setCurrentPlayerSid(current_player_sid)
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

  return (
    <div>
      <h1>Game</h1>
      {currentPlayerSid == playerSid && playerSid !== null ? (
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
    </div>

  )
}

export default Game