import React, { useEffect, useState } from 'react';
import Player from './Player';
//import CocktailModal from './CocktailModal';
import '../styles.css';

const Home = () => {
  const [players,setPlayers] = useState([]);
  const [currentPlayer,setCurrentPlayer] = useState(null);
  const [currentStep,setCurrentStep] = useState({});
  //const [selectedCocktail, setSelectedCocktail] = useState(null);
  //const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetch('/players')
      .then((res) => res.json())
      .then((data) => {
        setPlayers(data);

        const playerId = window.localStorage.getItem("currentPlayer");
        if (playerId){
          const cp = data.find(p => p.id===parseInt(playerId));
          setCurrentPlayer(cp);
          fetchGamestep(cp.step);
        }

      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const selectPlayer = (playerId) => {
    const cp = players.find(p => p.id===playerId);
    setCurrentPlayer(cp);
    window.localStorage.setItem("currentPlayer",playerId);
    fetchGamestep(cp.step);
  };

  const fetchGamestep = (gamestepId) => {
    fetch(`/gamestep/${gamestepId}`)
      .then((res) => res.json())
      .then((data) => {
        setCurrentStep(data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }
/*
  const openModal = (cocktail) => {
    document.body.classList.add('no-scroll');
    setSelectedCocktail(cocktail);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    document.body.classList.remove('no-scroll');
    setModalIsOpen(false);
    setSelectedCocktail(null);
  };*/

  return (
    players.length>0 ? (
      <div>
        <div className='column-container'>
          {currentPlayer ? (
            <>
              <h1>Bonjour {currentPlayer.name} 👋</h1>
              <h4 className='text-hr'><span>Bonjour</span></h4>
              <div className='top-element title'>Road Trip en Amérique - Étape {currentPlayer.step}</div>
              <img 
                src={`images/map/gamestep_${currentPlayer.step}.png`} 
                alt={`Carte de l'étape ${currentPlayer.step}`} 
                className='middle-element'
              />
              {currentStep ? (
                <>
                <div className='bottom-element title' style={{fontSize:'1em'}}>{currentStep.place}</div>
                  <br></br>
                  <img 
                    src={`images/place/place_${currentPlayer.step}.png`} 
                    alt={`Image de l'étape ${currentPlayer.step}`} 
                    className='top-element'
                    style={{height:"150px",objectFit:"cover"}}
                  />
                  <div className='middle-element title'>{currentStep.title}</div>
                  <div className='bottom-element text'>{currentStep.enigme}</div>
                </>
              ) : ''}
              <br></br>
            </>
          ) : (
            <>
              <h1>Sélectionnez votre profil</h1>
              <div>
                {players.sort((a,b) => a.name.localeCompare(b.name)).map((player) => (
                    <div 
                      key={player.id}
                      onClick={() => selectPlayer(player.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Player
                        player={player}
                      />
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
        <div className='text-center' style={{color:'var(--text-soft)!important',backgroundColor:'var(--background)',textDecoration:'none'}}>
          <span onClick={() => window.localStorage.removeItem("currentPlayer")} style={{color:'var(--text-soft)!important'}}>©</span>
          &nbsp;Maddy Wan 2024
        </div>
      </div>
    ) : <div className='column-container'>
      <h5><i>Chargement...</i></h5>
    </div>
  )
};

export default Home;
/*<CocktailModal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        cocktail={selectedCocktail}
      />*/