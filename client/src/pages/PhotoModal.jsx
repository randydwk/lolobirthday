import { useEffect, useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const PhotoModal = ({ isOpen, onRequestClose, photoSelected, players }) => {
  const [authorName,setAuthorName] = useState('');

  useEffect(() => {
    if (photoSelected && players){
      const author = players.find(p => p.id===photoSelected.author);
      if (author) setAuthorName(author.name);
    }
  },[players,photoSelected])

  if (!photoSelected || !isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {onRequestClose()}}
      contentLabel="Photo"
      className="modal text-center"
      overlayClassName="modal-overlay"
    >
      <img src={photoSelected.url} style={{maxWidth:'100%',maxHeight:`${window.innerHeight-200}px`}} alt={photoSelected.filename}/>
      <p className='text-center' style={{marginBlockStart:'0'}}>{authorName}</p>
      <h3 onClick={onRequestClose} className='modal-button'>Fermer</h3>
    </Modal>
  );
};

export default PhotoModal;
