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
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI2YTdiZmQyMy1kMWUwLTRiNGUtYjQwMC03MjBlOTlmMzYyNWEiLCJzdWIiOiJmZjAwMThiMDljY2RjOWQyYjhmNDc0NmU1NTUyNGE0ODE4YzM1ZTUyMmRlM2NhYjllNzhkNjE1MDE4NDA2OWYwZGQyYjQiLCJpc3MiOiJLRVlNQVNURVIiLCJleHAiOjE3NDg2MjA4MjUsImF1ZCI6IlZQUyIsInVzciI6IjViODNkNTg4LWEyMDgtNDUwNi05YjlhLTk0NGI4NDY3MjIyZSIsImlhdCI6MTc0ODUzNDQxNSwic2lkIjoiNWU4ZjhjNzEtN2ViNy00YWM2LTgzMjAtMDk5YWZhZmJjZDljIn0.WpyhosmZKWM6I8W0paGAOLBhTBY2T9SWk7nG7MDY2ExZUdvZSgKxfu2A_w9FDsPdYnlSl6JSYxkKpT1It9n-AglkrfeCvvfjSH411fey0_8z4GKIC40UfbkJIMruLQl9ilfdTUkiQzupjljv-VNideiF1auRqbOH-70CnNwnxvFsB88BWKBaDGpl2gQHSixzkDM4yjjy5PX-CS77SFFR_WK23Wu53rNUZvSMFeM_FHzSCjtHmXorqX2npYUfeCTxWn7tPEyOh5bTSTJ0yHuxqowGt6XgWvd0tLCUlV7mFgAmiys6jywwbtKmdsRQocLo-Jlxn0CoHu51TSYAlXNvYj5SW1zsQMN8QZUO05KAkXEFuejFGLn6CdQifeMRHDCuSI9U9Lo8k8TyO6XsLojOJ_JbYV2AD1xYiH059zDAj-8_q6FIYG8Vk28NpKp_DEEgSgTOYhUkmCcwnEdIe_30TRr_HDO679TjJ9heBehJioiMt6gr2ZIAY3fyalJ16ORQPTanQbuBipUd74OCQ6yOxtauOy-chJ28nHvwUZBAjrAd-LaWrV2qMk1B6kHZdsmhCmXwcc0kYyS-ZbHcRlIGix94HAExNrr2pR3FTKQ_so_URYEOxH0WUIKA2jt78jRNcAlDPG1GO0KInVYcF-iiWe9sZBYG7BjPxXQDz3IhBrY",
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

      // Обработка smart_app_data (действия из reply.js)
      if (event.type === "smart_app_data") {
        const { action } = event;
        if (action.type === "go_to_category" && action.category) {
          setCategory(action.category);
        } else if (action.type === "go_home") {
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
    };

    assistantInstance.on("data", handleData);
    setAssistant(assistantInstance);
    return () => {
      if (assistantInstance.close) assistantInstance.close();
    };
  }, [category]);

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
                  onClick={() => setCategory(key)}
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
            onClick={() => setCategory(null)}
          >
            <span className="button__inner">Назад</span>
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
