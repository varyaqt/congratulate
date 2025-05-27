import React from "react";
import "./index.css";
import { createRoot } from "react-dom/client"; // ✅ Правильный импорт
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(<App />);

//
// Developer Console triggers rerender in React Strict Mode while in 'development'
//
// More info:
// - https://stackoverflow.com/questions/61521734/why-does-my-create-react-app-console-log-twice
// - https://stackoverflow.com/questions/61328285/react-component-rendering-twice-when-using-usestate-hook
//
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
