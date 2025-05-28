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
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI0YTE2NzBiZi00Y2JjLTRiYjEtODRkZi1kMjJiODg4YTg0NmQiLCJzdWIiOiJmZjAwMThiMDljY2RjOWQyYjhmNDc0NmU1NTUyNGE0ODE4YzM1ZTUyMmRlM2NhYjllNzhkNjE1MDE4NDA2OWYwZGQyYjQiLCJpc3MiOiJLRVlNQVNURVIiLCJleHAiOjE3NDg1MDYxODIsImF1ZCI6IlZQUyIsInVzciI6IjViODNkNTg4LWEyMDgtNDUwNi05YjlhLTk0NGI4NDY3MjIyZSIsImlhdCI6MTc0ODQxOTc3Miwic2lkIjoiZjYyM2UyYzctY2I0Ny00NDlhLTgwMWEtM2MyMmExNTkxNTBjIn0.Zygf7_8p7dxJx2E7aC4NR_8KsNCTnxBUkjMMEXO9kl_4bQyBCOwiMZlYmC_4MCL7M6lON0btEs9e63MloB0VZ9dQrmie6COUMtiE0vO8y058YO9KNSL6EX1V1QixQht61uN2v_usdu93OpzYwAjVjzktHk0XThGmiOTVyZhPqdm91pzWS9SI-UyuzYg4AcPQoq5bgRIfxfR3UCDNJZjNT1NG_D2CZJ9PP_Zh54cfowC6WULNRV7WjwDb263OaBSM60hKwNhXfOyv9H7CzBzomMf4Joqebtk6I7qu-ajR4iQQjbBgVGg6EZNvrW3zMZXaLqQFwWMQEzW8Hzh7jeaJDgoPGI91f2WGJeWRvBTE6McnMKrIwGa2HsNeT7P1cBXQhA8pELphXRFo4L8JDKfK0EycBNM_CCIgnpEmN37SD0BKzdwjXt9EV6riLTrmLXi0qiYBrplZQ3FPV_04DVLlDQjf63Aq_2JS56jRaebwB3jfc8402twCvkXZLjeehjbXn3CKSLj1GDLSAVE_YykWRuHCiSZq1GO-BWv_vTl43wn_jgDgPrLHO8byaNhof6Jq9R3Mp5Mo21N8KZxf8IGMYjhD4dsXXmZmCNq7hck2kItJKpEKTc1szzlgWi8O1zxs8T4rNPmQ2j3g1YYaGSbcn8TXSzcD2zkFN3s5tfscdzc",
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
