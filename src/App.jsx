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

    const handleBack = (e) => {
      if (e.key === "Escape" || e.detail?.type === "back") {
        setCategory(null);
        if (assistant) {
          assistant.sendData({
            type: "navigation",
            navigation: { command: "go_home" },
            items: [],
            pronounceText: "Возвращаю в главное меню",
          });
        }
      }
    };

    try {
      const assistantInstance = initializeAssistant(getState);

      window.addEventListener("keydown", handleBack);
      window.addEventListener("back_button_pressed", handleBack);

      assistantInstance.on("error", (error) => {
        console.error("Assistant error:", error);
        setInitError(
          "Не удалось подключиться к ассистенту. Проверьте настройки."
        );
      });

      const handleData = (event) => {
        console.log("Событие от ассистента:", event);

        // предотвращаем повторную активацию при уже запущенном навыке
        if (
          event.type === "tts_state_update" &&
          event.state === "start" &&
          launched
        ) {
          console.log("Повторный старт проигнорирован");
          return;
        }

        if (event.type === "navigation") {
          const { command } = event.navigation;
          if (command === "go_to_category" && event?.navigation?.category) {
            setCategory(event.navigation.category);
            assistantInstance.sendData({
              type: "navigation",
              navigation: {
                command: "go_to_category",
                category: event.navigation.category,
              },
              items: [],
              pronounceText: `Открываю ${
                categories[event.navigation.category]
              }`,
            });
            return;
          } else if (command === "go_home") {
            setCategory(null);
            assistantInstance.sendData({
              type: "navigation",
              navigation: { command: "go_home" },
              items: [],
              pronounceText: "Возвращаю в главное меню",
            });
            return;
          }
        }

        if (event.type === "smart_app_data") {
          const action = event.smart_app_data || event.action;
          console.log("Получено действие:", action);

          // Обработка команды "назад" с пульта
          if (
            action?.type === "server_action" &&
            action?.action_id === "back"
          ) {
            setCategory(null);
            assistantInstance.sendData({
              type: "navigation",
              navigation: { command: "go_home" },
              items: [],
              pronounceText: "Возвращаю в главное меню",
            });
            return;
          }

          // Ваши кастомные действия
          if (action?.type === "go_to_category" && action?.category) {
            setCategory(action.category);
            assistantInstance.sendData({
              type: "navigation",
              navigation: {
                command: "go_to_category",
                category: action.category,
              },
              items: [],
              pronounceText: `Открываю ${categories[action.category]}`,
            });
            return;
          } else if (action?.type === "go_home") {
            setCategory(null);
            assistantInstance.sendData({
              type: "navigation",
              navigation: { command: "go_home" },
              items: [],
              pronounceText: "Возвращаю в главное меню",
            });
            return;
          }
        }

        if (event.type === "voice") {
          const text = event.asr?.hypotheses?.[0]?.text?.toLowerCase() || "";
          console.log("Голосовая команда:", text);

          if (text.includes("день рождения")) {
            setCategory("birthday");
            assistantInstance.sendData({
              type: "navigation",
              navigation: { command: "go_to_category", category: "birthday" },
              items: [],
              pronounceText: "Открываю поздравления с Днём рождения",
            });
            return;
          } else if (text.includes("новый год")) {
            setCategory("newyear");
            assistantInstance.sendData({
              type: "navigation",
              navigation: { command: "go_to_category", category: "newyear" },
              items: [],
              pronounceText: "Открываю новогодние поздравления",
            });
            return;
          } else if (text.includes("любим")) {
            setCategory("love");
            assistantInstance.sendData({
              type: "navigation",
              navigation: { command: "go_to_category", category: "love" },
              items: [],
              pronounceText: "Открываю поздравления для любимых",
            });
            return;
          } else if (text.includes("универсаль")) {
            setCategory("universal");
            assistantInstance.sendData({
              type: "navigation",
              navigation: { command: "go_to_category", category: "universal" },
              items: [],
              pronounceText: "Открываю универсальные поздравления",
            });
            return;
          } else if (
            (text.includes("назад") ||
              text.includes("меню") ||
              text.includes("домой")) &&
            category !== null
          ) {
            setCategory(null);
            assistantInstance.sendData({
              type: "navigation",
              navigation: { command: "go_home" },
              items: [],
              pronounceText: "Возвращаю в главное меню",
            });
            return;
          }
        }

        if (!launched) {
          setLaunched(true);
          assistantInstance.sendData({
            type: "smart_app_data",
            smart_app_data: { type: "welcome" },
            items: [],
            pronounceText: "Добро пожаловать! Выберите категорию поздравлений.",
          });
        }
      };

      assistantInstance.on("data", handleData);
      setAssistant(assistantInstance);

      // Функция очистки
      return () => {
        window.removeEventListener("keydown", handleBack);
        window.removeEventListener("back_button_pressed", handleBack);
        if (assistantInstance?.close) assistantInstance.close();
      };
    } catch (e) {
      console.error("Assistant initialization failed:", e);
      setInitError(
        "Навык не зарегистрирован или указаны ошибочные данные. Проверьте аутентификацию."
      );
    }
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
              <li
                className="greet"
                key={index}
                dangerouslySetInnerHTML={{
                  __html: text.replace(/\n/g, "<br/>"),
                }}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default App;
