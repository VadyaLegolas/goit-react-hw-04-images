import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ModalImage, ModalWindow, Overlay } from './Modal.styled';

const modalRoot = document.querySelector('#modal-root');

export const Modal = ({ image, onClose }) => {
  useEffect(() => {
    const handlePressESC = e => {
      if (e.code === 'Escape') onClose();
    };

    window.addEventListener('keydown', handlePressESC);

    return () => {
      window.removeEventListener('keydown', handlePressESC);
    };
  }, [onClose]);

  const handleBackdropClick = e => {
    if (e.currentTarget === e.target) onClose();
  };
  return createPortal(
    <Overlay onClick={handleBackdropClick}>
      <ModalWindow>
        <ModalImage src={image.largeImage} alt={image.tag} />
      </ModalWindow>
    </Overlay>,
    modalRoot
  );
};
