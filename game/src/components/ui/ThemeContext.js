import { createContext, useState, useEffect } from 'react';
import { HORROR_THEMES, DEFAULT_THEME, CRT_EFFECTS } from './theme';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('amber');
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [crtIntensity, setCrtIntensity] = useState(1.0);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('pixelversum_theme');
      const savedCRT = localStorage.getItem('pixelversum_crt_enabled');
      const savedIntensity = localStorage.getItem('pixelversum_crt_intensity');

      if (savedTheme && HORROR_THEMES[savedTheme]) {
        setThemeName(savedTheme);
        setTheme(HORROR_THEMES[savedTheme]);
      }

      if (savedCRT !== null) {
        setCrtEnabled(savedCRT === 'true');
      }

      if (savedIntensity !== null) {
        setCrtIntensity(parseFloat(savedIntensity));
      }
    } catch (error) {
      console.error('Error loading theme settings:', error);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem('pixelversum_theme', themeName);
      localStorage.setItem('pixelversum_crt_enabled', crtEnabled.toString());
      localStorage.setItem('pixelversum_crt_intensity', crtIntensity.toString());
    } catch (error) {
      console.error('Error saving theme settings:', error);
    }
  };

  useEffect(() => {
    saveSettings();
  }, [themeName, crtEnabled, crtIntensity]);

  const changeTheme = (newThemeName) => {
    if (HORROR_THEMES[newThemeName]) {
      setThemeName(newThemeName);
      setTheme(HORROR_THEMES[newThemeName]);
    }
  };

  const toggleCRT = () => {
    setCrtEnabled(!crtEnabled);
  };

  const value = {
    theme,
    themeName,
    changeTheme,
    availableThemes: Object.keys(HORROR_THEMES),
    crtEnabled,
    setCrtEnabled,
    toggleCRT,
    crtIntensity,
    setCrtIntensity,
    crtEffects: CRT_EFFECTS,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
