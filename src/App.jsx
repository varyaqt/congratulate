import React, { useEffect, useState } from "react";
import data from "./data/congratulations.json";
import { createAssistant, createSmartappDebugger } from "@salutejs/client";
import "./App.css";

const categories = {
  birthday: "День рождения",
  newyear: "Новый год",
  love: "Любимым",
  universal: "Универсальные",
};

const initializeAssistant = (getState) => {
  if (process.env.NODE_ENV === "development") {
    return createSmartappDebugger({
      token:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJkZmY1MGNiYi00YjYwLTQ2NzYtODk2NC1lZDhhNmRjZmUyYjgiLCJzdWIiOiJmZjAwMThiMDljY2RjOWQyYjhmNDc0NmU1NTUyNGE0ODE4YzM1ZTUyMmRlM2NhYjllNzhkNjE1MDE4NDA2OWYwZGQyYjQiLCJpc3MiOiJLRVlNQVNURVIiLCJleHAiOjE3NDg0NDIzODQsImF1ZCI6IlZQUyIsInVzciI6IjViODNkNTg4LWEyMDgtNDUwNi05YjlhLTk0NGI4NDY3MjIyZSIsImlhdCI6MTc0ODM1NTk3NCwic2lkIjoiMGZmMWIxODQtODhmZC00YTVjLTg1ZGEtMDc5NjM0NDcwOTZjIn0.r9cvLQruyr0uoSBfEcioIb2M0DMM_0vNygF9iXNZxarrgbatVffHxpbeRwaUUpJFKwFhSgl9vEewigz8HlQV0SUrDVu3AdL9HjCFx6JlNG3r-m3CPEBsFyqyMnZigI7inhEKsS2wl1k4bUbLSUyeLzeCD_q3wG02OxhwNDIeIHNbDSnB14U2dF6mwmPDWaZGxg-W_tWy_KlOTt0SMTyweOy6I6Qq5Z2e5QuF1pa1MrhpAaZqIFl2beHYap27ZDjRE38ncnQ5TESRpvcGd8YHVvQsYfhaW60QWe8XhnNZ3GAQAJqC8tPpAUEBWgCllkY-9eEeqsNWtetXvvr2ZAgGvguxzXjK253gvK16BRzqzpdx4YN6cqYmFYfQ395DckkiNNSE6AA10W7YgYKCMvnEL5rTQ3ob_2ghj15gjWsHJ-BEKczsjJiT6zwH1QEwWTcaSWOBqzgCtyzLT71gheS7MlLm-Tst_sWevZIhpKptHe7bq1UUzVp0VnwhqYCpjAAwnXcrHgF3f4rF9RVh4ucGbCNPg-q8Y0eSYXgrPtthzy-4c7EP4BLTKelwccLGtu3kRMaA7UkpP76csxElCMJCEHeRkFJ3vJjagcDHjd7QIQj6V9ibNzER7vCcgjIAsSQaK9NLBghwpWcQppNPy2Ntl7A_KinXAB8Z4k05Guor9h4",
      initPhrase: "запусти поздравления",
      getState,
      settings: {
        dubbing: true, // включение озвучки
      },
    });
  }
  return createAssistant({ getState });
};

const App = () => {
  const [category, setCategory] = useState(null);
  const [assistant, setAssistant] = useState(null);

  useEffect(() => {
    // Функция для получения текущего состояния
    const getState = () => ({
      category,
      // другие данные состояния, если нужны
    });

    // Инициализация ассистента
    const assistantInstance = initializeAssistant(getState);

    // Обработчик событий
    const handleData = (event) => {
      console.log("Событие от ассистента:", event);

      if (event.type === "navigation") {
        const { command } = event.navigation;
        if (command === "go_to_category" && event.navigation.category) {
          setCategory(event.navigation.category);
        } else if (command === "go_home") {
          setCategory(null);
        }
      }

      // Обработка голосовых команд (ASR)
      if (event.type === "voice") {
        const text = event.asr?.hypotheses?.[0]?.text?.toLowerCase() || "";

        if (text.includes("день рождения")) setCategory("birthday");
        else if (text.includes("новый год")) setCategory("newyear");
        else if (text.includes("любим")) setCategory("love");
        else if (text.includes("универсаль")) setCategory("universal");
        else if (text.includes("назад") || text.includes("меню"))
          setCategory(null);
      }

      // Обработка команд персонажа (если используется)
      if (event.type === "character") {
        // ... аналогичная логика обработки
      }
    };

    // Подписываемся на события
    assistantInstance.on("data", handleData);

    // Сохраняем экземпляр ассистента
    setAssistant(assistantInstance);

    // Функция очистки (без использования .off())
    return () => {
      // Просто закрываем ассистент, если есть метод close
      if (assistantInstance.close) {
        assistantInstance.close();
      }
    };
  }, [category]); // Зависимость от category, так как getState использует её

  return (
    <div style={{ padding: 20 }}>
      {category === null ? (
        <>
          <h1>Поздравления</h1>
          {Object.entries(categories).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              style={{ margin: 10 }}
            >
              {label}
            </button>
          ))}
        </>
      ) : (
        <>
          <h1>{categories[category]}</h1>
          <ul>
            {data[category].map((text, index) => (
              <li key={index} style={{ marginBottom: 10 }}>
                {text}
              </li>
            ))}
          </ul>
          <button onClick={() => setCategory(null)}>Назад</button>
        </>
      )}
    </div>
  );
};

export default App;
