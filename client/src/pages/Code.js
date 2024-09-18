import React, { useEffect } from 'react';
import './styles.css';

const Code = () => {
  useEffect(() => {
    const playerId = window.localStorage.getItem("currentPlayer");
    const queryParameters = new URLSearchParams(window.location.search);
    const code = queryParameters.get("c");
    if (playerId && code){
      fetch(`/code`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ code:code, playerId:playerId }),
      }).then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Response not ok");
        }
      }).then((data) => {
        if (data.message === "SUCCESS") {
          window.location.replace("/?s=s");
        } else if (data.message === "VISITED") {
          window.location.replace("/?s=v");
        } else if (data.message === "END") {
          window.location.replace("/?s=e");
        } else if (data.message === "ACCIDENT") {
          window.location.replace("/?s=a");
        }
      }).catch((error) => {
        console.error('Error with qrcode:', error);
      });
    } else {
      window.location.replace("/");
    }
  },[]);

  return (
    <div>
      <div className='column-container'>
        <h1 className='bg'>Analyse du QRCode ...</h1>
      </div>
    </div>
  )
};

export default Code;