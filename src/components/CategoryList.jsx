import React from 'react';

const categories = {
  birthday: 'День рождения',
  newyear: 'Новый год',
  love: 'Любимым',
  universal: 'Универсальные'
};

const CategoryList = ({ onSelect }) => {
  return (
    <div className="menu">
      <h1 className="title">Выберите категорию</h1>
      <div className="buttons">
        {Object.entries(categories).map(([key, label]) => (
          <button key={key} className="button" onClick={() => onSelect(key)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
