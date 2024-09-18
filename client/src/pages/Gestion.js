import React, { useEffect, useState } from 'react';
import './styles.css';

const Home = () => {
  const [players,setPlayers] = useState([]);
  
  useEffect(() => {
    fetch('/players')
    .then((res) => res.json())
    .then((data) => setPlayers(data))
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
  },[]);

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
              <>
                <div className='score left'>{player.name}</div>
                <div className='score right'>{player.score}</div>
                <br></br>
              </>
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

export default Home;