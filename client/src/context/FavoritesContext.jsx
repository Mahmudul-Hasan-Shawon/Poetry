import { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext(null);

const STORAGE_KEY = 'poetry-favorites';

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (writingId) => {
    setFavorites((prev) =>
      prev.includes(writingId) ? prev : [...prev, writingId]
    );
  };

  const removeFavorite = (writingId) => {
    setFavorites((prev) => prev.filter((id) => id !== writingId));
  };

  const toggleFavorite = (writingId) => {
    if (favorites.includes(writingId)) {
      removeFavorite(writingId);
    } else {
      addFavorite(writingId);
    }
  };

  const isFavorite = (writingId) => favorites.includes(writingId);

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
}
