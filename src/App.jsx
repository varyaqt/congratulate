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
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI3MDA4NmJhNC1lYTE3LTQwNWQtODZiNS1hYjg5Yzc4YTUxOTUiLCJzdWIiOiJmZjAwMThiMDljY2RjOWQyYjhmNDc0NmU1NTUyNGE0ODE4YzM1ZTUyMmRlM2NhYjllNzhkNjE1MDE4NDA2OWYwZGQyYjQiLCJpc3MiOiJLRVlNQVNURVIiLCJleHAiOjE3NDg5NDczNzQsImF1ZCI6IlZQUyIsInVzciI6IjViODNkNTg4LWEyMDgtNDUwNi05YjlhLTk0NGI4NDY3MjIyZSIsImlhdCI6MTc0ODg2MDk2NCwic2lkIjoiNzEyYTU3YjktNzg1OC00YzEyLWFlOGItODM0OTE4MTQyNWMxIn0.Sig1RcMqAEglmQylZmsVCt6i2g9XPD8lQBX-7VwkxNJvyN2jIMPfY3eAiUTN1z3aqsEia-IEksTADhtanUdBunCAWgBwuOA4GTRO6H2BDmoBfk1uDLT8bsqgJcgdC6cZOskX_GpA5oN28l3d_2XDWIp6UgnW4MyLlXx21TBOy3-v2iavPklrfGhyPyyXV__f60Sw2_dqAwWwFlby2aBxBfqpyScA72QrB8sj20QgBaaGITsXhHeqodlLrPHcbyplfaFMFRBtm8UaUPPSLjAca18MqsSU_JDw6-6ULg7GRciGA8WIWPa30yyaVgyjNBMelc2n9d3Jt1D-WuoclItN4sbNO1n_hgJq6QD7bQ6cGiJtzOwhWbp4DagYiVBsjfTz0QwlJkapzvQvgvvJbc1Wt7Y4RQTtfPIJkkrvMVdTcNbTByP0-L0HRO_Tj8pnMlBfUTa4DlYp7dRDUdFUsyDI3Q0CqlrZHoub8btBLFBgUMaKlN6XwjlRdFB8ug6MWpnaLzxmvFHXMcWooTpw9XAH4w2YSv6FRN6_A214oExIO2OldTOhGELnZrbhCkdfKDlocbRvDS6N3ay7AA0LKsEB_QQxoOCo4LI_cvptsCgNijf02LDrx2mdKxPstLD9PzwbFDVzHapn1mQUwfwF_lr8LsvaHJIL8A1yMvYQ-MDggxY",
      initPhrase: "запусти Поздравлю",
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
  const [initError, setInitError] = useState(null); // Новое состояние для ошибки

  useEffect(() => {
    const getState = () => ({
      category,
    });

    try {
      const assistantInstance = initializeAssistant(getState);

      // Добавляем обработчик ошибок соединения
      assistantInstance.on("error", (error) => {
        console.error("Assistant error:", error);
        setInitError(
          "Не удалось подключиться к ассистенту. Проверьте настройки."
        );
      });

      const handleData = (event) => {
        console.log("Событие от ассистента:", event);

        if (event.type === "navigation") {
          const { command } = event.navigation;
          if (command === "go_to_category" && event?.navigation?.category) {
            setCategory(event?.navigation?.category);
          } else if (command === "go_home") {
            setCategory(null);
          }
        }

        if (event.type === "smart_app_data") {
          const command = event.command?.data || event.action;
          if (action?.type === "go_to_category" && action?.category) {
            setCategory(action.category);
          } else if (action?.type === "go_home") {
            setCategory(null);
          }
        }

        // Обработка голосовых команд (ASR) - ЗАМЕНЯЕМ ЭТУ ЧАСТЬ
        if (event.type === "voice") {
          const text = event.asr?.hypotheses?.[0]?.text?.toLowerCase() || "";
          console.log("Распознанная голосовая команда:", text); // Добавляем лог

          // Улучшенная обработка команд
          if (
            text.includes("день рождения") ||
            text.includes("с днем рождения")
          ) {
            setCategory("birthday");
            assistant?.sendAction({
              type: "go_to_category",
              category: "birthday",
            });
          } else if (
            text.includes("новый год") ||
            text.includes("с новым годом")
          ) {
            setCategory("newyear");
            assistant?.sendAction({
              type: "go_to_category",
              category: "newyear",
            });
          } else if (text.includes("любим") || text.includes("для любимых")) {
            setCategory("love");
            assistant?.sendAction({ type: "go_to_category", category: "love" });
          } else if (
            text.includes("универсаль") ||
            text.includes("универсальные")
          ) {
            setCategory("universal");
            assistant?.sendAction({
              type: "go_to_category",
              category: "universal",
            });
          } else if (
            text.includes("назад") ||
            text.includes("меню") ||
            text.includes("домой")
          ) {
            setCategory(null);
            assistant?.sendAction({ type: "go_home" });
          }
        }
      };

      assistantInstance.on("data", handleData);
      setAssistant(assistantInstance);
    } catch (e) {
      console.error("Assistant initialization failed:", e);
      setInitError(
        "Навык не зарегистрирован или указаны ошибочные данные. Проверьте аутентификацию."
      );
    }

    return () => {
      if (assistant?.close) assistant.close();
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
