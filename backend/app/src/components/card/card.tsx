import * as React from 'react';

interface CardProps {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <div className="flex border border-gray-200 rounded shadow-md bg-white">
      <div className="m-4">{children}</div>
    </div>
  );
};

export default Card;
