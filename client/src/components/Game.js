import { io } from "socket.io-client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const socket = io.connect('http://localhost:5000');

function Game() {
  const [articleURL, setArticleURL] = useState("");
  const { gamePin } = useParams();
  const [scrapedData, setScrapedData] = useState(null);

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
      <form onSubmit={retrieveLink}>
        <input
          type="text"
          placeholder='DBA Article Link'
          value={articleURL}
          onChange={(e) => setArticleURL(e.target.value)}
        />
        <input type="submit" value="Submit" />
      </form>
      {scrapedData && (
        <div>
          <h2>Scraped data</h2>
          <pre>{scrapedData[0]}</pre>
        </div>
      )}
    </div>

  )
}

export default Game