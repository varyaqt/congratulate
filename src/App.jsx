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
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiIzODU1MGY3NS1jMTI4LTQwNjgtYmIwYS1iYTJlMmY3NWI4YjkiLCJzdWIiOiJmZjAwMThiMDljY2RjOWQyYjhmNDc0NmU1NTUyNGE0ODE4YzM1ZTUyMmRlM2NhYjllNzhkNjE1MDE4NDA2OWYwZGQyYjQiLCJpc3MiOiJLRVlNQVNURVIiLCJleHAiOjE3NDg2ODg3MDcsImF1ZCI6IlZQUyIsInVzciI6IjViODNkNTg4LWEyMDgtNDUwNi05YjlhLTk0NGI4NDY3MjIyZSIsImlhdCI6MTc0ODYwMjI5Nywic2lkIjoiYTI4MDZiZmEtOGE3MC00Y2Q1LWFlMjMtMWYyOWMxZTNjZDJhIn0.KcCVcH34TCRDW8pgGrXAwX8cu4Sx6v2YKjn-FEt_FoENrzOUkBs1Yr0bGYUZ1do-hglxcGB32i-2E0Tq73ttjGfcGpzLiU1E5z9NuT7ZfyiskSI8d-KiuPAC2dIJfExGRsp11FrQsN5Q_OAQUR7SGC2A0T3-PZExRQvafk8TxJSQIc19Bjvq9ns1BYhWDlTmpjMw6MxwedXJ3tXOtsUSoyNA5FTvyJfeawfvMIkdSaK6n49I9qlpRvfm7BkagTxkKTbEfKUoNFA49xhD-9qEzcX-mOg0Fr8fDxZQyXrs_di0EHJWcTq3DstvZr6R3LQHCIA9xxBDNTjMJ4h2sZu3WW-kUdSttxcYPNtjahKetoY03VbwwqIx0gFe4HgO5n1mFa-h7mFGwfxGmS1DEWj2bpWbTWf-R6lYWUfywYKBbr7G27YCtSYhO9L4joCuwEqSrzNNVaGGfmuApLHTwrVMZvFZqze-vzcEBCPPSdebdiqa4xatqF8_p8k7EyU3mGvJmlbSS4hbJQ5zuYF_ceOP3yZzT6X4BRv6tDRwABv7Rrua6CZaIYJ961Zl9Pv8z4L0m8aqfcrGih0GFeyKwiKG6YyKzDb3lVhp4qHBRhFW5K_rgenAeGtiSpzbpTH849qrplFKSewKHSsvLuQzfM25st5X3yryAMtlb6GwpffWjhg",
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
