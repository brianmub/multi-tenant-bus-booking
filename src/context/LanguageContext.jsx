import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../utils/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem("genesis_lang") || "en";
  });

  useEffect(() => {
    localStorage.setItem("genesis_lang", locale);
  }, [locale]);

  const t = (key, params = {}) => {
    let str = translations[locale]?.[key] || translations["en"]?.[key] || key;
    
    // Replace {param} variables
    Object.keys(params).forEach(k => {
      str = str.replace(`{${k}}`, params[k]);
    });
    
    return str;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
