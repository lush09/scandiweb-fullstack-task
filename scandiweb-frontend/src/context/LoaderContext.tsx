import React, { createContext, useContext, useState } from "react";

interface LoaderContextType {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const useLoaderContext = () => {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error("useLoaderContext must be used within a LoaderProvider");
  return ctx;
};

export const LoaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoaderContext.Provider>
  );
};
