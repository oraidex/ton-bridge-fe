"use client";

import React, { createContext, useContext, useState } from "react";

export type Themes = "light" | "dark";

export const ThemeContext = createContext<{
  theme: Themes;
  setTheme: React.Dispatch<React.SetStateAction<Themes>>;
}>({
  theme: "light",
  setTheme: () => {},
});

export const ThemeProvider = (props: React.PropsWithChildren<{}>) => {
  const [theme, setTheme] = useState<Themes>("dark");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`app ${theme}`}>{props.children}</div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  return {
    theme,
    setTheme,
  };
};
