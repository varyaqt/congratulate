import React from 'react';

const categoryLabels = {
  birthday: 'День рождения',
  newyear: 'Новый год',
  love: 'Любимым',
  universal: 'Универсальные'
};

const CongratulationsList = ({ category, texts, onBack }) => {
  return (
    <div className="category-page">
      <h1 className="title">{categoryLabels[category]}</h1>
      <ul className="congrats-list">
        {texts.map((text, index) => (
          <li key={index} className="congrats-item">{text}</li>
        ))}
      </ul>
      <button className="button back-button" onClick={onBack}>Назад</button>
    </div>
  );
};

export default CongratulationsList;
