import React, { useCallback, useEffect, useState } from 'react';
import './styles.css';
import useWebSocket from "react-use-websocket"

const Gestion = () => {
  const [players,setPlayers] = useState([]);
  const [photos,setPhotos] = useState([]);

  useEffect(() => {
    fetchPlayers();
  },[]);

  // Web sockets
  const { lastJsonMessage } = useWebSocket(process.env.REACT_APP_WS_URL, {
    queryParams: { username:"gestion" }
  });

  const addPhoto = useCallback((url,authorId,photoId) => {
    console.log(players.find(player => player.id===authorId));
    const photo = {
      url: url,
      //author: players.find(player => player.id===authorId).name,
      id: photoId,
      xPos: Math.random() * window.innerWidth,
      yPos: Math.random() * window.innerHeight,
      xSpeed: 2 + Math.random(),
      ySpeed: 2 + Math.random(),
    };
    setPhotos((prev) => [...prev, photo]);
    setTimeout(() => {
      setPhotos((prev) => prev.filter(p => p.id !== photo.id));
    }, 180000);
  },[players]);

  useEffect(() => {
    if (lastJsonMessage !== null) {
      if (lastJsonMessage.msg === 'SCORE') {
        fetchPlayers();
      } else if (lastJsonMessage.msg === 'PHOTO') {
        addPhoto(lastJsonMessage.url,lastJsonMessage.authorId,lastJsonMessage.photoId);
      }
      console.log(lastJsonMessage);
    }
  }, [lastJsonMessage,addPhoto])

  useEffect(() => {
    const movePhotos = () => {
      setPhotos((prevPhotos) =>
        prevPhotos.map((photo) => {
          let newXPos = photo.xPos + photo.xSpeed;
          let newYPos = photo.yPos + photo.ySpeed;

          if (newXPos >= (window.innerWidth-300) || newXPos <= 0) {
            newXPos = photo.xPos;
            photo.xSpeed = -photo.xSpeed;
          }

          if (newYPos >= (window.innerHeight-300) || newYPos <= 0) {
            newYPos = photo.yPos;
            photo.ySpeed = -photo.ySpeed;
          }

          return { ...photo, xPos: newXPos, yPos: newYPos };
        })
      );
    };

    const intervalId = setInterval(movePhotos, 25);
    return () => clearInterval(intervalId);
  }, [photos]);

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
          {photos.map((photo) => (
            <img
              key={photo.id}
              src={photo.url}
              alt={photo.author}
              style={{
                position: 'absolute',
                left: `${photo.xPos}px`,
                top: `${photo.yPos}px`,
                maxWidth: '300px',
                maxHeight: '300px',
                zIndex: 100
              }}
            />
          ))}
          </div>
          <img src="/images/qrcode.png" alt="qrcode" style={{position:'fixed',right:'20px',bottom:'20px',width:'100px'}}></img>
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