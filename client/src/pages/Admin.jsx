import React, { useEffect, useState } from 'react';
import './styles.css';
import useWebSocket from "react-use-websocket"

const Admin = () => {
  const [params,setParams] = useState({});

  const [players,setPlayers] = useState([]);
  const [score,setScore] = useState(0);

  const karaokeMax = 30;
  const [karaokeSongs,setKaraokeSongs] = useState([]);
  const [videoUrl,setVideoUrl] = useState('');

  useEffect(() => {
    fetchParams();
    fetchPlayers();
    fetchKaraokeSongs();
  },[]);

  // Web sockets
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(process.env.REACT_APP_WS_URL, {
    queryParams: { username:"admin" }
  });
  
  useEffect(() => {
    if (lastJsonMessage !== null) {
      if (lastJsonMessage.msg === 'PARAMS') {
        fetchParams();
      } else if (lastJsonMessage.msg === 'PLAYERS') {
        fetchPlayers();
      } else if (lastJsonMessage.msg === 'KARAOKE') {
        fetchKaraokeSongs();
      }
      console.log(lastJsonMessage);
    }
  }, [lastJsonMessage])

  const fetchParams = () => {
    fetch('/params')
    .then((res) => res.json())
    .then((data) => setParams(data))
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
  }

  const fetchPlayers = () => {
    fetch('/players')
    .then((res) => res.json())
    .then((data) => setPlayers(data))
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

  const updateParams = (param,value) => {
    fetch(`/params`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ param:param, value:value }),
    }).then((res) => {
      if (res.ok) {
        fetchParams();
        return res.json();
      } else {
        throw new Error("Response not ok");
      }
    }).catch((error) => {
      console.error('Error updating parameters :', error);
    });
  }

  const updatePlayerScore = (playerScore,playerId) => {
    fetch(`/playerscore`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ playerId:playerId, score:playerScore }),
    }).then((res) => {
      if (res.ok) {
        fetchPlayers();
        return res.json();
      } else {
        throw new Error("Response not ok");
      }
    }).catch((error) => {
      console.error('Error updating player score :', error);
    });
  }

  const checkKaraokeSong = (song) => {
    fetch(`/karaokecheck`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ song:song }),
    }).then((res) => {
      if (res.ok) {
        fetchKaraokeSongs();
        return res.json();
      } else {
        throw new Error("Response not ok");
      }
    }).catch((error) => {
      console.error('Error checking karaoke song :', error);
    });
  }

  const deleteKaraokeSong = (song) => {
    fetch(`/karaoke/${song}`, {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json'},
    }).then((res) => {
      if (res.ok) {
        fetchKaraokeSongs();
        return res.json();
      } else {
        throw new Error("Response not ok");
      }
    }).catch((error) => {
      console.error('Error deleting karaoke song :', error);
    });
  }

  return (
    <div>
      <div className='column-container'>
        <h1 className='bg' style={{marginBlockEnd:0}}>Gestion générale</h1>
        <br></br>
        {/* PLAYERS */}
        <div className='top-element title'>Scores</div>
        <div className='middle-element title'>
          <input type="number" value={score} onChange={(e) => setScore(e.target.value)} placeholder="Score à mettre à jour"/>
        </div>
        {players.sort((a,b) => a.name.localeCompare(b.name)).map(player => (
          <div className='middle-element text' key={player.id}>
            {player.name} ({player.score})&nbsp;
            <button onClick={() => updatePlayerScore(parseInt(score),player.id)} className='btn'>=</button>
            <button onClick={() => updatePlayerScore(player.score+parseInt(score),player.id)} className='btn'>+</button>
          </div>
        ))}
        <div className='bottom-element' style={{height:'16px'}}></div>
        <br></br>
        {/* KARAOKE */}
        <div className='top-element title'>Karaoke ({karaokeSongs.length}/{karaokeMax})</div>
        {karaokeSongs.map(karaoke => (
          <>
            <div className='middle-element text' key={karaoke.id}>
              <span style={{textDecoration:(karaoke.checked?'line-through':'none')}}>{karaoke.song} ({players.length>0 ? players.find(p => (p.id===karaoke.submitter)).name : ''})</span>
              {karaoke.checked ? <button onClick={() => checkKaraokeSong(karaoke.id)} className='btn btn-success'>Fait</button>
              : <button onClick={() => checkKaraokeSong(karaoke.id)} className='btn'>À faire</button>}
              <button onClick={() => deleteKaraokeSong(karaoke.id)} className='btn'>Libérer la place</button>
            </div>
          </>
        ))}
        <div className='middle-element title'>
          <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Lien YouTube"/>
        </div>
        <div className='middle-element title'>
          <button className="btn" onClick={() => {sendJsonMessage({msg:"VIDEO",url:videoUrl})}}>Envoyer</button>
          <button className="btn" onClick={() => {sendJsonMessage({msg:"VIDEO",url:''})}}>Retirer</button>
        </div>
        <div className='bottom-element' style={{height:'16px'}}></div>
        <br></br>
        {/* PLAYERS */}
        <div className='top-element title'>Votes</div>
        {players.sort((a,b) => b.votes-a.votes).map(player => (
          <div className='middle-element text' key={player.id}>
            <span style={{color:(player.hasvoted?'var(--success)':'var(--danger)')}}>{player.name}</span> : {player.votes}
          </div>
        ))}
        <div className='bottom-element' style={{height:'16px'}}></div>
        <br></br>
        {/* PARAMS */}
        <div className='top-element title'>Paramètres</div>
        <div className='middle-element' style={{paddingBottom:'10px'}}>
          {params.karaoke ? <button className='btn btn-success' onClick={() => updateParams('karaoke',false)}>Karaoké : ON</button>
          : <button className='btn btn-danger' onClick={() => updateParams('karaoke',true)}>Karaoké : OFF</button>}
        </div>
        <div className='middle-element'>
          {params.votes ? <button className='btn btn-success' onClick={() => updateParams('votes',false)}>Votes : ON</button>
          : <button className='btn btn-danger' onClick={() => updateParams('votes',true)}>Votes : OFF</button>}
        </div>
        <div className='bottom-element' style={{height:'16px'}}></div>
        <br></br>
      </div>
      <div className='text-center' style={{color:'var(--text-soft)!important',backgroundColor:'var(--background)',textDecoration:'none'}}>
        <span onClick={() => window.localStorage.removeItem("currentPlayer")} style={{color:'var(--text-soft)!important'}}>©</span>
        &nbsp;Maddy Wan 2024
      </div>
    </div>
  )
};

export default Admin;