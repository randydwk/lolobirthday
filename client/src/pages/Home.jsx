import React, { useEffect, useState } from 'react';
import GameModal from './GameModal';
import './styles.css';
import useWebSocket, { ReadyState } from "react-use-websocket"

const Home = () => {
  const [players,setPlayers] = useState([]);
  const [currentPlayer,setCurrentPlayer] = useState(null);
  const [gameModalIsOpen, setGameModalIsOpen] = useState(false);
  const [gameModalState, setGameModalState] = useState(null);

  // Web sockets
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(process.env.REACT_APP_WS_URL, {
    queryParams: { username:currentPlayer?currentPlayer.name:"unknown-user" }
  });

  useEffect(() => {
    if (lastJsonMessage !== null) {
      console.log(lastJsonMessage);
    }
  }, [lastJsonMessage])

  const handleClickSendMessage = () => sendJsonMessage({message:"hello",for:"gestion"});

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];
  
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
            <button onClick={handleClickSendMessage}>Send Hello</button>
            {connectionStatus}
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