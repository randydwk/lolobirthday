import React, { useEffect, useState } from 'react';
import './styles.css';
import useWebSocket from "react-use-websocket"

const Gestion = () => {
  const [players,setPlayers] = useState([]);

  useEffect(() => {
    fetchPlayers();
  },[]);

  // Web sockets
  const { lastJsonMessage } = useWebSocket(process.env.REACT_APP_WS_URL, {
    queryParams: { username:"gestion" }
  });

  useEffect(() => {
    if (lastJsonMessage !== null) {
      if (lastJsonMessage.msg === 'SCORE') {
        fetchPlayers();
      }
      console.log(lastJsonMessage);
    }
  }, [lastJsonMessage])

  const fetchPlayers = () => {
    fetch('/players')
    .then((res) => res.json())
    .then((data) => setPlayers(data))
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
  }

  return (
    <div>
      {players.length>0 ? (
        <>
          <div className='column-container'>
            <h1 className='bg'>🎂 Lolo & Steeve Birthday 🎂</h1>
          </div>
          <div className='score-container'>
            <h4 className='score title'>Scores</h4>
            {players.sort((a,b) => b.score-a.score).map((player) => (
              <div key={player.id}>
                <div className='score left'>{player.name}</div>
                <div className='score right'>{player.score}</div>
                <br></br>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className='column-container'>
          <h5><i>Chargement...</i></h5>
        </div>
      )}
    </div>
  )
};

export default Gestion;