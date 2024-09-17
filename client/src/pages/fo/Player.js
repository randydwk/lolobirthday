import React from 'react';

const Player = ({ player }) => {
  return (
    <div className='box-container'>
      <p className='box-text'>{player.name}</p>
    </div>
  );
};

export default Player;
