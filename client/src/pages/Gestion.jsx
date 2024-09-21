import React, { useCallback, useEffect, useState } from 'react';
import './styles.css';
import useWebSocket from "react-use-websocket"

const Gestion = () => {
  const [players,setPlayers] = useState([]);
  const [photos,setPhotos] = useState([]);
  const [videoUrl,setVideoUrl] = useState('');
  const maxPhotoSize = 500;

  useEffect(() => {
    fetchPlayers();
  },[]);

  // Web sockets
  const { lastJsonMessage } = useWebSocket(process.env.REACT_APP_WS_URL, {
    queryParams: { username:"gestion" }
  });

  const addPhoto = useCallback((url,authorId,photoId) => {
    const photo = {
      url: url,
      //author: players.find(player => player.id===authorId).name,
      id: photoId,
      xPos: Math.random() * (window.innerWidth-maxPhotoSize),
      yPos: Math.random() * (window.innerHeight-maxPhotoSize),
      xSpeed: 2 + Math.random() * 2,
      ySpeed: 2 + Math.random() * 2,
    };
    setPhotos((prev) => [...prev, photo]);
    setTimeout(() => {
      setPhotos((prev) => prev.filter(p => p.id !== photo.id));
    }, 180000);
  },[]);

  useEffect(() => {
    if (lastJsonMessage !== null) {
      if (lastJsonMessage.msg === 'PLAYERS') {
        fetchPlayers();
      } else if (lastJsonMessage.msg === 'PHOTO') {
        addPhoto(lastJsonMessage.url,lastJsonMessage.authorId,lastJsonMessage.photoId);
      } else if (lastJsonMessage.msg === 'VIDEO') {
        if (!lastJsonMessage.url) setVideoUrl('');
        else {
          const match = lastJsonMessage.url.match(/(?:https?:\/)?(?:www\.)?(?:youtube\.com\/(?:[^\n\s]+\/\S+\/|(?:v|embed|watch)\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          const shortMatch = lastJsonMessage.url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
          if (match) {
            setVideoUrl(match[1]);
          } else if (shortMatch) {
            setVideoUrl(shortMatch[1]);
          } else {
            setVideoUrl('');
          }
        }
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
          if (newXPos >= (window.innerWidth-maxPhotoSize) || newXPos <= 0) {
            newXPos = photo.xPos;
            photo.xSpeed = -photo.xSpeed;
          }
          if (newYPos >= (window.innerHeight-maxPhotoSize) || newYPos <= 0) {
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
          <h1 className='bg' style={{position:'fixed',opacity:(videoUrl?'0.5':'1')}}>🎂 Lolo & Steeve Birthday 🎂</h1>
          {videoUrl ? <iframe
            width={window.innerWidth}
            height={window.innerHeight}
            style={{position:'fixed',zIndex:'-10'}}
            src={`https://www.youtube.com/embed/${videoUrl}?autoplay=1&controls=0`}
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen>
          </iframe>:''}
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
                zIndex: 100,
                opacity:(videoUrl?'0.5':'1')
              }}
            />
          ))}
          </div>
          <img src="/images/qrcode.png" alt="qrcode" style={{position:'fixed',right:'20px',bottom:'20px',width:'100px',opacity:(videoUrl?'0.8':'1')}}></img>
          <div className='score-container' style={{opacity:(videoUrl?'0.5':'1')}}>
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