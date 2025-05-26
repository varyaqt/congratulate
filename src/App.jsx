import React, { useEffect, useState } from 'react';
import data from './data/congratulations.json';
import {
  createAssistant,
  createSmartappDebugger
} from '@sberdevices/assistant-client';
import './App.css';

const categories = {
  birthday: 'День рождения',
  newyear: 'Новый год',
  love: 'Любимым',
  universal: 'Универсальные',
};

const initializeAssistant = (getState) => {
  if (process.env.NODE_ENV === 'development') {
    return createSmartappDebugger({
      token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI1OWFmYjJlNi0yNzcyLTRmY2MtOTU3Zi01ODcwMTNkMWQ2ODIiLCJzdWIiOiJmZjAwMThiMDljY2RjOWQyYjhmNDc0NmU1NTUyNGE0ODE4YzM1ZTUyMmRlM2NhYjllNzhkNjE1MDE4NDA2OWYwZGQyYjQiLCJpc3MiOiJLRVlNQVNURVIiLCJleHAiOjE3NDgyODIzNTcsImF1ZCI6IlZQUyIsInVzciI6IjViODNkNTg4LWEyMDgtNDUwNi05YjlhLTk0NGI4NDY3MjIyZSIsImlhdCI6MTc0ODE5NTk0Nywic2lkIjoiMDZlNDBhNDEtZmQzYy00NDAxLWI1MTQtNmRhODJmODA5NWYxIn0.WukEMfOHzCtOcqqKb8mCMa8rOuw7s9uJ9207m_zKmL2R3ssBF9-z8mziRduSZKuuq6KPk5paYXanhGnMxJMtf5N9fUjqXPnWYbWlQE-WLTsbPez1ZYrUfln7N9RpTAsmAUreOXSyRBpfSrQsyeWIBNL1hv_rOEcUbXE7z2Jg099R2vcX65EvLxlP5DFOYEu_mhN0EnmTyCXoBxAMeGtMvp-B8OKdd-LyZj4ANZGNPkuuEteV4jUCdRO1YeDXmuyhGKokGPsry-83FY3Yaug_x6sRxOpoEvKPUfMT1WqCKcLofC-F0-6GY1u0tHrSbm95IFiTxV4g4wa4p0WBlyUo9lkrD5UpwiKaUYTlqLEdyNgh1CletQRTKtI7p3DLDe5z6j0VXrTn3tGpKkZXu4VMrWteL-z9qwxrLSIig5w_5Qq_YAbnuWsN2hLs3p7Wtmj31mbMNrhEH4Qo19wrv4PqVAip91uh_APIozQTz_aFsFkpu4jtURBQwa07yr7gJB3iy0cJFOD5r48FEnWA_TmFi3yz8G2qINVUL5keH8-mE_eToggHOFw9-vF5jA4bRuNdI9pgU1hTJFokGdynYC7EIJ3EEK8qzWJgE1oZK0glFlqOY8yRVHYqgIFPeQyUVjdWfXG5XEKmdXOmpGmQ8xbC8yjJ3BZb6luv5QBuArZGHOE',
      initPhrase: 'запусти поздравления',
      getState,
    });
  }

  return createAssistant({ getState });
};

const App = () => {
  const [category, setCategory] = useState(null);
  const [assistant, setAssistant] = useState(null);

  useEffect(() => {
    const assistantInstance = initializeAssistant(() => ({ category }));

    assistantInstance.on('data', (event) => {
      console.log('[assistant data]:', event);

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

      // fallback: распознавание по голосу
      const text = event.asr?.hypotheses?.[0]?.text?.toLowerCase();
      if (text?.includes('день рождения')) setCategory('birthday');
      else if (text?.includes('новый год')) setCategory('newyear');
      else if (text?.includes('любим')) setCategory('love');
      else if (text?.includes('универсаль')) setCategory('universal');
      else if (text?.includes('назад') || text?.includes('меню')) setCategory(null);
    });

    setAssistant(assistantInstance);
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
