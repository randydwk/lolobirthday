import Modal from 'react-modal';

Modal.setAppElement('#root');

const GameModal = ({ isOpen, onRequestClose, currentPlayer, state }) => {

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {onRequestClose()}}
      contentLabel="QRCode Success"
      className="modal text-center"
      overlayClassName="modal-overlay"
    >
      {state==='s' ? (
        <>
          <h2 className='text-center' style={{marginBlockStart:'0'}}>Nouvelle destination :</h2>
          <h3>{currentPlayer.steptitle} ({currentPlayer.stepplace})</h3>
          <p>+{Math.floor(5+currentPlayer.step*10)} points</p>

          <h3 onClick={() => {onRequestClose()}} className='modal-button btn-success'>En route !</h3>
        </>
      ) : (
        <>
          {state==='v' ? (
            <>
              <h2 className='text-center' style={{marginBlockStart:'0'}}>Déjà visité !</h2>
              <p>Ne faisons pas marche arrière ! Nous avons déjà visité cet endroit...</p>
            </>
          ) : ''}
          {state==='e' ? (
            <>
              <h2 className='text-center' style={{marginBlockStart:'0'}}>Fin du Road Trip !</h2>
              <p>Le Road Trip est déjà terminé, il n'y a plus d'autres endroits à visiter malheureusement...</p>
            </>
          ) : ''}
          {state==='a' ? (
            <>
              <h2 className='text-center' style={{marginBlockStart:'0'}}>Accident !</h2>
              <p>Vous vous êtes trompé de route et avez fait un demi-tour trop brusque...</p>
              <p>-30 points</p>
            </>
          ) : ''}
          <h3 onClick={() => {onRequestClose()}} className='modal-button btn-danger'>Fermer</h3>
        </>
      )}
    </Modal>
  );
};

export default GameModal;
