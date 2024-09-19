import React, { useEffect, useState } from 'react';
import './styles.css';
import useWebSocket from "react-use-websocket"

const Gestion = () => {
  const [players,setPlayers] = useState([]);
  const [photoUrl,setPhotoUrl] = useState('');

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
      } else if (lastJsonMessage.msg === 'PHOTO') {
        setPhotoUrl(lastJsonMessage.url);
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
          <h1 className='bg' style={{position:'fixed'}}>🎂 Lolo & Steeve Birthday 🎂</h1>
            {photoUrl ? <>
              <img src={photoUrl} alt={photoUrl}></img>
            </> : <></>}
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