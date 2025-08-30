import React from "react";

function InfoPopup({ isOpen, onClose, title, content }) {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>
          ×
        </button>
        <h3 className="popup-title">{title}</h3>
        <div className="popup-body">{content}</div>
      </div>
    </div>
  );
}

export default InfoPopup;
