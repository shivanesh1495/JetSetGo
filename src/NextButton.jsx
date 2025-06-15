import React from 'react';
import './NextButton.css';

const NextButton = ({ onClick }) => {
  return (
    <button className="next-button" onClick={onClick}>
      <span className="label">Next</span>
      <div className="circle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="white"
          viewBox="0 0 24 24"
        >
          <path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
        </svg>
      </div>
    </button>
  );
};

export default NextButton;
