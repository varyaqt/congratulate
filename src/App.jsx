import React, { useEffect, useState } from 'react';
import data from './data/congratulations.json';
import { createAssistant } from '@sberdevices/assistant-client';
import './App.css';

const App = () => {
  const [category, setCategory] = useState(null);
  const [assistant, setAssistant] = useState(null);

  const categories = {
    birthday: 'День рождения',
    newyear: 'Новый год',
    love: 'Любимым',
    universal: 'Универсальные'
  };

  useEffect(() => {
    const assistant = createAssistant({ getState: () => ({ category }) });

    assistant.on('data', (event) => {
      const command = event.navigation?.command || event.character?.command;

      if (command && typeof command === 'object') {
        const { type } = command;

        if (type === 'go_to_category') {
          const cat = command.category;
          if (data[cat]) {
            setCategory(cat);
          }
        } else if (type === 'go_home') {
          setCategory(null);
        }
      }

      // fallback: голос
      const text = event.asr?.hypotheses?.[0]?.text?.toLowerCase();
      if (text?.includes('день рождения')) setCategory('birthday');
      else if (text?.includes('новый год')) setCategory('newyear');
      else if (text?.includes('любим')) setCategory('love');
      else if (text?.includes('универсаль')) setCategory('universal');
      else if (text?.includes('назад') || text?.includes('меню')) setCategory(null);
    });

    setAssistant(assistant);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      {category === null ? (
        <>
          <h1>Выберите категорию:</h1>
          {Object.entries(categories).map(([key, label]) => (
            <button key={key} onClick={() => setCategory(key)} style={{ margin: 10 }}>
              {label}
            </button>
          ))}
        </>
      ) : (
        <>
          <h1>{categories[category]}</h1>
          <ul>
            {data[category].map((text, index) => (
              <li key={index} style={{ marginBottom: 10 }}>{text}</li>
            ))}
          </ul>
          <button onClick={() => setCategory(null)}>Назад</button>
        </>
      )}
    </div>
  );
};

export default App;
