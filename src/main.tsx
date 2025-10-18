import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { ColorSchemeProvider } from "./contexts/ColorSchemeContext";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light">
    <ColorSchemeProvider>
      <App />
    </ColorSchemeProvider>
  </ThemeProvider>
);
