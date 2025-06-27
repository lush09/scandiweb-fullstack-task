import React from "react";
import logo from "../assets/logo.png";
import "../index.css";

import { useLoaderContext } from "../context/LoaderContext";

const Loader: React.FC = () => {
  const { loading } = useLoaderContext();
  if (!loading) return null;
  return (
    <div className="global-loader-overlay">
      <img src={logo} alt="Loading..." className="global-loader-logo" />
    </div>
  );
};

export default Loader;
