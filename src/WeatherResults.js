import React from 'react';
import './WeatherResult.css';

function WeatherResult(props) {

  return (
    <div className="result">
      <div className="result__title">{props.day}</div>
      <div className="result__title">{props.weather}</div>
    
    </div>
  );
}

export default WeatherResult;