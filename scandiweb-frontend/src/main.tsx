import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./fonts.css";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { CartProvider } from "./context/CartContext";
import { CategoryProvider } from "./context/CategoryContext";
import { LoaderProvider, useLoaderContext } from "./context/LoaderContext";
import Loader from "./components/Loader";

const client = new ApolloClient({
  uri: import.meta.env.VITE_GRAPHQL_API,
  cache: new InMemoryCache(),
});

function AppWithLoader() {
  const { loading } = useLoaderContext();
  return (
    <>
      <Loader />
      <App />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <LoaderProvider>
        <CartProvider>
          <CategoryProvider>
            <AppWithLoader />
          </CategoryProvider>
        </CartProvider>
      </LoaderProvider>
    </ApolloProvider>
  </React.StrictMode>,
);
