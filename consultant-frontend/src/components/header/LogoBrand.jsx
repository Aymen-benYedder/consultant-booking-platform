import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/logo.css';

const LogoBrand = ({ scrolled }) => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <img
        src="/logo.svg"
        alt="Lavocato"
        className={`h-8 w-auto transition-colors duration-200 ${
          scrolled ? 'filter-primary' : 'filter-white'
        }`}
      />
      <span className={`text-xl font-bold transition-colors duration-200 ${
        scrolled ? 'text-primary' : 'text-white'
      }`}>
        Lavocato
      </span>
    </Link>
  );
};

export default LogoBrand;
