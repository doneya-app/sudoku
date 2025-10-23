import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ColorSchemeProvider } from "./contexts/ColorSchemeContext";
import { GameOptionsProvider } from "./contexts/GameOptionsContext";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light">
      <ColorSchemeProvider>
        <GameOptionsProvider>
          <TooltipProvider>
            <App />
          </TooltipProvider>
        </GameOptionsProvider>
      </ColorSchemeProvider>
    </ThemeProvider>
  </StrictMode>
);
