import React, { createContext, useContext, useEffect, useState } from "react";
import { useLoaderContext } from "./LoaderContext";

interface Category {
  id: string;
  name: string;
}

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: any;
  refreshCategories: () => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const useCategoryContext = () => {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error("useCategoryContext must be used within a CategoryProvider");
  return ctx;
};

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(() => {
    const cached = localStorage.getItem("categories");
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(categories.length === 0);
  const [error, setError] = useState<any>(null);
  const { setLoading: setGlobalLoading } = useLoaderContext();

  const fetchCategories = async () => {
    setLoading(true);
    setGlobalLoading(true);
    setError(null);
    try {
      const { GET_CATEGORIES: query } = await import("../graphql/queries");
      const { default: client } = await import("../apollo/client");
      const result = await client.query({ query });
      setCategories(result.data.categories);
      localStorage.setItem("categories", JSON.stringify(result.data.categories));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
    // eslint-disable-next-line
  }, []);

  const refreshCategories = () => {
    localStorage.removeItem("categories");
    setCategories([]);
    fetchCategories();
  };

  return (
    <CategoryContext.Provider value={{ categories, loading, error, refreshCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};
