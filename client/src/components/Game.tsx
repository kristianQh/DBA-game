import React, { useState, useEffect, FormEvent } from 'react';
import { Socket } from 'socket.io-client';

interface GameProps {
  socket: Socket;
}

type ScrapedData = any;

function Game({ socket }: GameProps) {
  const [articleURL, setArticleURL] = useState<string>('');
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [currentPlayerSid, setCurrentPlayerSid] = useState<string | null>(null);
  const [playerSid, setPlayerSid] = useState<string | null>(null);
  const [gamePin, setGamePin] = useState<string | null>(null);

  useEffect(() => {
    socket.on('player_turn', (data: { current_player_sid: string; game_pin: string }) => {
      setCurrentPlayerSid(data.current_player_sid);
      setGamePin(data.game_pin);
    });

    socket.on('set_client_sid', (data: string) => {
      setPlayerSid(data);
      console.log(playerSid);
    });

    socket.on('scraped_data', (data: ScrapedData) => {
      setScrapedData(data);
      console.log(scrapedData);
    });

    // Clean up the event listeners when the component unmounts
    return () => {
      socket.off('player_turn');
      socket.off('set_client_sid');
      socket.off('scraped_data');
    };
  }, [socket]);

  const retrieveLink = (event: FormEvent<HTMLFormElement>) => {
    // Wait on scrapper
    event.preventDefault();
    if (gamePin) {
      socket.emit('scrape', { url: articleURL, pin: gamePin });
    }
  };

  const confirmInput = () => {
    const rdyButton = document.getElementById('rdyButton');
    if (rdyButton) {
      rdyButton.setAttribute('disabled', 'true');
    }
    if (gamePin) {
      socket.emit('confirm_price', { pin: gamePin });
    }
  };

  return (
    <div>
      <h1>Game</h1>
      {currentPlayerSid === playerSid && (
        <form onSubmit={retrieveLink}>
          <input
            type="text"
            placeholder='DBA Article Link'
            value={articleURL}
            onChange={(e) => setArticleURL(e.target.value)}
          />
          <input type="submit" value="Submit" />
        </form>
      )}
      {scrapedData && (
        <div>
          <h2>Scraped data</h2>
          <h3>{scrapedData.title}</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{scrapedData.description}</p>
          {scrapedData.image_urls && (
            <img src={scrapedData.image_urls[0]} alt="Scraped content" />
          )}
        </div>
      )}
      <button id="rdyButton" onClick={confirmInput}>Test button</button>
    </div>
  );
}

export default Game;