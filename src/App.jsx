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
      token: process.env.REACT_APP_TOKEN,
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`, // REACT_APP_SMARTAPP="поздравления для важных событий" !!!!
      getState,
      settings: {
        dubbing: true, // включает озвучку
      },
    });
  }
  return createAssistant({ getState });
};

const App = () => {
  const [category, setCategory] = useState(null);
  const [assistant, setAssistant] = useState(null);
  const [initError, setInitError] = useState(null);
  const [launched, setLaunched] = useState(false); // предотвращает повторный старт

  useEffect(() => {
    const getState = () => ({
      item_selector: {
        items: [],
        ignored_words: [],
      },
    });

    try {
      const assistantInstance = initializeAssistant(getState);

      assistantInstance.on("error", (error) => {
        console.error("Assistant error:", error);
        setInitError(
          "Не удалось подключиться к ассистенту. Проверьте настройки."
        );
      });

      const handleData = (event) => {
        console.log("Событие от ассистента:", event);

        // предотвращаем повторную активацию при уже запущенном навыке
        if (event.type === "tts_state_update" && event.state === "start" && launched) {
          console.log("Повторный старт проигнорирован");
          return;
        }

        if (event.type === "navigation") {
          const { command } = event.navigation;
          if (command === "go_to_category" && event?.navigation?.category) {
            setCategory(event.navigation.category);
          } else if (command === "go_home") {
            setCategory(null);
          }
        }

        if (event.type === "smart_app_data") {
          const action = event.action;
          if (action?.type === "go_to_category" && action?.category) {
            setCategory(action.category);
          } else if (action?.type === "go_home") {
            setCategory(null);
          }
        }

        if (event.type === "voice") {
          const text = event.asr?.hypotheses?.[0]?.text?.toLowerCase() || "";
          console.log("Голосовая команда:", text);

          if (text.includes("день рождения")) {
            setCategory("birthday");
            assistantInstance.sendAction({ type: "go_to_category", category: "birthday" });
          } else if (text.includes("новый год")) {
            setCategory("newyear");
            assistantInstance.sendAction({ type: "go_to_category", category: "newyear" });
          } else if (text.includes("любим")) {
            setCategory("love");
            assistantInstance.sendAction({ type: "go_to_category", category: "love" });
          } else if (text.includes("универсаль")) {
            setCategory("universal");
            assistantInstance.sendAction({ type: "go_to_category", category: "universal" });
          } else if (
            (text.includes("назад") || text.includes("меню") || text.includes("домой")) &&
            category !== null
          ) {
            setCategory(null);
            assistantInstance.sendAction({ type: "go_home" });
          }
        }

        if (!launched) setLaunched(true);
      };

      assistantInstance.on("data", handleData);
      setAssistant(assistantInstance);
    } catch (e) {
      console.error("Assistant initialization failed:", e);
      setInitError("Навык не зарегистрирован или указаны ошибочные данные. Проверьте аутентификацию.");
    }

    return () => {
      if (assistant?.close) assistant.close();
    };
  }, [launched]);

  return (
    <div className="container">
      {category === null ? (
        <>
          <div className="header">
            <h1 className="header__title">Поздравляю</h1>
            <h2 className="header__description">
              Выберите категорию для поздравления!
            </h2>
          </div>
          <div className="menu__inner">
            <div className="menu__list">
              {Object.entries(categories).map(([key, label]) => (
                <button
                  className="button"
                  key={key}
                  onClick={() => {
                    setCategory(key);
                    assistant?.sendAction({
                      type: "go_to_category",
                      category: key,
                    });
                  }}
                >
                  <span className="button__inner">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <h1 className="header__title">{categories[category]}</h1>
          <button
            className="button button__back"
            onClick={() => {
              setCategory(null);
              assistant?.sendAction({ type: "go_home" });
            }}
          >
            <span className="button__inner">Вернуться в меню</span>
          </button>
          <ul className="congratulations__inner">
            {data[category].map((text, index) => (
              <li className="greet" key={index}>
                {text}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default App;
