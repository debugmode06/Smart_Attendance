import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// Mock SSID for development testing (matches user's Wi-Fi image)
if (process.env.NODE_ENV === 'development') {
  window.MOCK_SSID = "LAPTOP-IGFCEJ3S 3033";
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

