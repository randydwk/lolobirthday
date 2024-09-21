import React, { useEffect, useState } from 'react';
import GameModal from './GameModal';
import KaraokeModal from './KaraokeModal';
import PhotoModal from './PhotoModal';
import './styles.css';
import useWebSocket from "react-use-websocket"

const Home = () => {
  const [params,setParams] = useState({karaoke:false,votes:false});

  const [players,setPlayers] = useState([]);
  const [currentPlayer,setCurrentPlayer] = useState(null);

  const [gameModalIsOpen, setGameModalIsOpen] = useState(false);
  const [gameModalState, setGameModalState] = useState(null);

  const karaokeMax = 30;
  const [karaokeSongs,setKaraokeSongs] = useState([]);
  const [karaokeModalIsOpen, setKaraokeModalIsOpen] = useState(false);

  const [selectedPlayerVote, setSelectedPlayerVote] = useState(null);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [photosDisplay, setPhotosDisplay] = useState(9);
  const [photoModalIsOpen, setPhotoModalIsOpen] = useState(false);
  const [photoSelected, setPhotoSelected] = useState(null);

  // Web sockets
  const { lastJsonMessage } = useWebSocket(process.env.REACT_APP_WS_URL, {
    queryParams: { username:currentPlayer?currentPlayer.name:"unknown-user" }
  });
  
  useEffect(() => {
    if (lastJsonMessage !== null) {
      if (lastJsonMessage.msg === 'PARAMS') {
        fetchParams();
      } else if (lastJsonMessage.msg === 'KARAOKE') {
        fetchKaraokeSongs();
      } else if (lastJsonMessage.msg === 'PHOTO') {
        fetchPhotos();
      }
      console.log(lastJsonMessage);
    }
  }, [lastJsonMessage])

  useEffect(() => {
    fetch('/players')
      .then((res) => res.json())
      .then((data) => setPlayers(data))
      .catch((error) => {
        console.error('Error fetching data:', error);
      });

    const playerId = window.localStorage.getItem("currentPlayer");
    if (playerId){
      fetchCurrentPlayer(playerId);
      fetchKaraokeSongs();
      fetchParams();
      fetchPhotos();

      const queryParameters = new URLSearchParams(window.location.search);
      const state = queryParameters.get("s");
      if (state) openGameModal(state);
    }
  },[]);

  const selectPlayer = (playerId) => {
    const cp = players.find(p => p.id===playerId);
    setCurrentPlayer(cp);
    window.localStorage.setItem("currentPlayer",playerId);
    fetchCurrentPlayer(cp.id);
    fetchKaraokeSongs();
    fetchParams();
    fetchPhotos();
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

  const fetchKaraokeSongs = () => {
    fetch('/karaoke')
    .then((res) => res.json())
    .then((data) => setKaraokeSongs(data))
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
  }

  const fetchParams = () => {
    fetch('/params')
    .then((res) => res.json())
    .then((data) => setParams(data))
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
  }

  const handleVote = () => {
    fetch(`/vote`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ playerId:currentPlayer.id, vote:selectedPlayerVote }),
    }).then((res) => {
      if (res.ok) {
        fetchCurrentPlayer(currentPlayer.id);
        return res.json();
      } else {
        throw new Error("Response not ok");
      }
    }).catch((error) => {
      console.error('Error for vote :', error);
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
            fetchPhotos();
        })
        .catch(error => {
            console.error('Error uploading photo:', error);
            window.alert('Erreur pendant l\'envoi de la photo');
            setUploadingPhoto(false);
        });
      }
  };

  const fetchPhotos = () => {
    fetch('/photos')
    .then((res) => res.json())
    .then((data) => setPhotos(data))
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
  }

  const displayMorePhotos = () => {
    setPhotosDisplay(Math.min(photosDisplay+9,photos.length));
  }

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

  // Karaoke Modal

  const openKaraokeModal = () => {
    document.body.classList.add('no-scroll');
    setKaraokeModalIsOpen(true);
  };

  const closeKaraokeModal = () => {
    document.body.classList.remove('no-scroll');
    setKaraokeModalIsOpen(false);
    fetchKaraokeSongs();
  };

  // Photo Modal

  const openPhotoModal = (photo) => {
    document.body.classList.add('no-scroll');
    setPhotoSelected(photo);
    setPhotoModalIsOpen(true);
  };

  const closePhotoModal = () => {
    document.body.classList.remove('no-scroll');
    setPhotoModalIsOpen(false);
    setPhotoSelected(null);
  };


  return (
    <div>
      {currentPlayer ? (
        <>
          <div className='column-container'>
            <h1 className='bg' style={{marginBlockEnd:0}}>Bonjour {currentPlayer.name} 👋</h1>
            <h3 className='bg'>{currentPlayer.score} points</h3>
            {/* ROAD TRIP */}
            <div className='top-element title'>🇺🇸 Road Trip aux US - {currentPlayer.step===0 ? 'Départ' : (currentPlayer.step===10 ? 'Fin' : `Étape ${currentPlayer.step}`)}</div>
            <div className='middle-element' style={{backgroundColor:'white'}}>
              <img style={{objectFit:'cover',maxWidth:'min(100%,250px)'}} 
                src={`images/map/gamestep_${currentPlayer.step}.png`} 
                alt={`Carte de l'étape ${currentPlayer.steptitle}`} 
              />
            </div>
            <div className='middle-element title' style={{fontSize:'1em'}}>{currentPlayer.stepplace}</div>
            <img 
              src={`images/place/place_${currentPlayer.step}.png`} 
              alt={`Étape ${currentPlayer.steptitle}`}
              className='middle-element'
              style={{height:"150px",objectFit:"cover"}}
            />
            <div className='middle-element title'>{currentPlayer.steptitle}</div>
            <div className='bottom-element text'>{currentPlayer.stepenigm}</div>
            <br></br>
            {/* KARAOKE */}
            {params.karaoke ? (
              <>
                <div className='top-element title'>🎤 Karaoké</div>
                <div className='middle-element text'>Inscrivez-vous au karaoké avant 22h (dans la limite des places disponibles) ! Cliquez sur le bouton ci-dessous, et saisissez le titre d'une chanson.</div>
                <div className='middle-element text' style={{textAlign:'center'}}><i>{karaokeMax-karaokeSongs.length} places disponibles</i></div>
                <div className='bottom-element' style={{paddingBottom:'20px',marginBottom:'20px'}}>
                  <button onClick={openKaraokeModal} className="btn" disabled={karaokeSongs.length>=karaokeMax} style={{pointerEvents:(karaokeSongs.length>=karaokeMax?'none':'')}}>🎵 Je choisis une chanson</button>
                </div>
              </>
            ):''}
            {/* VOTES */}
            {params.votes ? (
              <>
                <div className='top-element title'>🎭 Concours du meilleur costume</div>
                {currentPlayer.hasvoted}
                {currentPlayer.hasvoted ? (
                  <>
                    <div className='middle-element text' style={{textAlign:'center'}}>Merci d'avoir voté !</div>
                    <div className='bottom-element' style={{height:'16px'}}></div>
                    <br></br>
                  </>
                ) : (
                  <>
                    <div className='middle-element text'>Sélectionnez une personne et cliquez sur voter pour donner votre voix ! Attention, vous ne pouvez voter qu'une seule fois !</div>
                    <div className='middle-element' style={{ paddingBottom: '16px' }}>
                      <select onChange={(e) => setSelectedPlayerVote(e.target.value)}>
                        <option value="">Choisissez une personne</option>
                        {players.map(player => (<option key={player.id} value={player.id}>{player.name}</option>))}
                      </select>
                    </div>
                    <div className='bottom-element' style={{ paddingBottom: '20px', marginBottom: '20px' }}>
                      <button onClick={handleVote} className="btn">🗳️ À voter !</button>
                    </div>
                  </>
                )}
              </>
            ):''}
            {/* PHOTOS */}
            <div className='top-element title'>📷 Photos ({photos.length})</div>
            <div className='middle-element photo-container'>
              {photos.slice(0,photosDisplay).map(p => (
                <img
                  onClick={() => openPhotoModal(p)}
                  className='photo'
                  src={p.url}
                  alt={p.filename}
                  key={p.id}
                />
              ))}
            </div>
            <div className='bottom-element' style={{ paddingBottom: '78px', marginBottom: '10px' }}>
              <button className='btn' onClick={displayMorePhotos} disabled={photosDisplay>=photos.length} style={{pointerEvents:(photosDisplay>=photos.length?'none':'')}}>Afficher plus</button>
            </div>
          </div>

          <div className="sticky-bar" v-if="isPart(user.id)&&!isFinished">
            {uploadingPhoto ? <>
              <button style={{pointerEvents:"none"}} disabled>📷 Envoi en cours...</button>
            </> : 
            <>
              <label style={{display:"block"}}>
                  <input type="file" accept="image/*" capture="user" style={{display:"none"}} onChange={uploadPhoto}/>
                  <button style={{pointerEvents:"none"}}>📷 Prendre une photo</button>
              </label>
            </>}
          </div>

          <GameModal
            isOpen={gameModalIsOpen}
            onRequestClose={closeGameModal}
            currentPlayer={currentPlayer}
            state={gameModalState}
          />

          <KaraokeModal
            isOpen={karaokeModalIsOpen}
            onRequestClose={closeKaraokeModal}
            currentPlayer={currentPlayer}
          />

          <PhotoModal
            isOpen={photoModalIsOpen}
            onRequestClose={closePhotoModal}
            photoSelected={photoSelected}
            players={players}
          />
        </>
      ) : (
        players.length>0 ? (
          <>
            <div className='column-container'>
              <h1 className='bg'>Sélectionnez votre profil</h1>
              <div className='btn-column'>
                {players.sort((a,b) => a.name.localeCompare(b.name)).map((player) => (
                  <button 
                    key={player.id}
                    onClick={() => selectPlayer(player.id)}
                    style={{ cursor: 'pointer' }}
                    className='btn'
                  >{player.name}
                  </button>
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