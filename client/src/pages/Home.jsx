import React, { useEffect, useState } from 'react';
import GameModal from './GameModal';
import './styles.css';
import useWebSocket from "react-use-websocket"

const Home = () => {
  const [players,setPlayers] = useState([]);
  const [currentPlayer,setCurrentPlayer] = useState(null);
  const [gameModalIsOpen, setGameModalIsOpen] = useState(false);
  const [gameModalState, setGameModalState] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Web sockets
  useWebSocket(process.env.REACT_APP_WS_URL, {
    queryParams: { username:currentPlayer?currentPlayer.name:"unknown-user" }
  });
  
  useEffect(() => {
    const playerId = window.localStorage.getItem("currentPlayer");
    if (playerId){
      fetchCurrentPlayer(playerId);

      const queryParameters = new URLSearchParams(window.location.search);
      const state = queryParameters.get("s");
      if (state) openGameModal(state);
    } else {
      fetch('/players')
      .then((res) => res.json())
      .then((data) => setPlayers(data))
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
    }
  },[]);

  const selectPlayer = (playerId) => {
    const cp = players.find(p => p.id===playerId);
    setCurrentPlayer(cp);
    window.localStorage.setItem("currentPlayer",playerId);
    fetchCurrentPlayer(cp.id);
  };

  const fetchCurrentPlayer = (playerId) => {
    fetch(`/player/${playerId}`)
      .then((res) => res.json())
      .then((data) => {
        setCurrentPlayer(data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }

  // Photo

  const uploadPhoto = (event) => {
    const file = event.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('authorId', currentPlayer.id);
        setUploadingPhoto(true);

        fetch(`/upload`, {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            console.log('Upload successful:', data);
            setUploadingPhoto(false);
        })
        .catch(error => {
            console.error('Error uploading photo:', error);
            window.alert('Erreur pendant l\'envoi de la photo');
            setUploadingPhoto(false);
        });
      }
  };

  // Game Modal

  const openGameModal = (state) => {
    document.body.classList.add('no-scroll');
    setGameModalState(state);
    setGameModalIsOpen(true);
  };

  const closeGameModal = () => {
    document.body.classList.remove('no-scroll');
    setGameModalIsOpen(false);
    setGameModalState('');
  };

  return (
    <div>
      {currentPlayer ? (
        <>
          <div className='column-container'>
            <h1 className='bg' style={{marginBlockEnd:0}}>Bonjour {currentPlayer.name} 👋</h1>
            <h3 className='bg'>{currentPlayer.score} points</h3>
            <div className='top-element title'>Road Trip en Amérique - Étape {currentPlayer.step}</div>
            <img 
              src={`images/map/gamestep_${currentPlayer.step}.png`} 
              alt={`Carte de l'étape ${currentPlayer.steptitle}`} 
              className='middle-element'
            />
            <div className='bottom-element title' style={{fontSize:'1em'}}>{currentPlayer.stepplace}</div>
              <br></br>
              <img 
                src={`images/place/place_${currentPlayer.step}.png`} 
                alt={`Étape ${currentPlayer.steptitle}`}
                className='top-element'
                style={{height:"150px",objectFit:"cover"}}
              />
              <div className='middle-element title'>{currentPlayer.steptitle}</div>
              <div className='bottom-element text'>{currentPlayer.stepenigm}</div>
            <br></br>
          </div>

          <div className="sticky-bar" v-if="isPart(user.id)&&!isFinished">
            {uploadingPhoto ? <>
              <button style={{pointerEvents:"none"}} disabled><i className="fa fa-camera"></i> Envoi en cours...</button>
            </> : 
            <>
              <label style={{display:"block"}}>
                  <input type="file" accept="image/*" capture="user" style={{display:"none"}} onChange={uploadPhoto}/>
                  <button style={{pointerEvents:"none"}}><i className="fa fa-camera"></i> Prendre une photo</button>
              </label>
            </>}
          </div>
          <div className='sticky-bar-space'></div>

          <GameModal
            isOpen={gameModalIsOpen}
            onRequestClose={closeGameModal}
            currentPlayer={currentPlayer}
            state={gameModalState}
          />
        </>
      ) : (
        players.length>0 ? (
          <>
            <div className='column-container'>
              <h1 className='bg'>Sélectionnez votre profil</h1>
              <div>
                {players.sort((a,b) => a.name.localeCompare(b.name)).map((player) => (
                    <div 
                      key={player.id}
                      onClick={() => selectPlayer(player.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className='box-container'>
                        <p className='box-text'>{player.name}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <div className='column-container'>
            <h5><i>Chargement...</i></h5>
          </div>
        )
      )}
      <div className='text-center' style={{color:'var(--text-soft)!important',backgroundColor:'var(--background)',textDecoration:'none'}}>
        <span onClick={() => window.localStorage.removeItem("currentPlayer")} style={{color:'var(--text-soft)!important'}}>©</span>
        &nbsp;Maddy Wan 2024
      </div>
    </div>
  )
};

export default Home;