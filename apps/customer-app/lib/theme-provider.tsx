import React, { createContext, useContext } from "react";

const ThemeContext = createContext({
  theme: "light",
  colors: {
    tint: "#C8974B",
    background: "#F7F5F0",
    text: "#17222B",
  },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider
      value={{
        theme: "light",
        colors: {
          tint: "#C8974B",
          background: "#F7F5F0",
          text: "#17222B",
        },
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
