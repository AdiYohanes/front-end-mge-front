// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import AppRouter from "./router";
import { ThemeProvider } from "./components/common/ThemeProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
      <AppRouter />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
