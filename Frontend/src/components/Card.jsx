// src/components/Card.jsx
import React from "react";

const Card = ({ title, value }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg p-5 rounded-xl shadow-lg text-white w-full">
      <h3 className="text-sm text-white/70">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
};

export default Card;