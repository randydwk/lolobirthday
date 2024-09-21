import Modal from 'react-modal';
import { useState } from 'react';

Modal.setAppElement('#root');

const KaraokeModal = ({ isOpen, onRequestClose, currentPlayer }) => {

  const [song, setSong] = useState('');

  const handleSubmit = async () => {
    if (!song) return;

    try {
      const response = await fetch('/karaoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          song: song,
          submitter: currentPlayer.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit karaoke song');
      onRequestClose();
    } catch (error) {
      console.error('Error submitting karaoke song:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {onRequestClose()}}
      contentLabel="Karaoke"
      className="modal text-center"
      overlayClassName="modal-overlay"
    >
      <h2 className='text-center' style={{marginBlockStart:'0'}}>Choisir une chanson</h2>
      <input
        type="text"
        value={song}
        onChange={(e) => setSong(e.target.value)}
        placeholder="Entrez le titre d'une chanson"
      />

      <h3 onClick={handleSubmit} className='modal-button btn-success'>Envoyer</h3>
      <h3 onClick={onRequestClose} className='modal-button btn-danger'>Annuler</h3>
    </Modal>
  );
};

export default KaraokeModal;
