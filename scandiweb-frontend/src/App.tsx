import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";

const App: React.FC = () => (
  <Router>
    <Header />
    <Routes>
      <Route path="/" element={<Navigate to="/all" />} />
      <Route path="/:categoryName" element={<CategoryPage />} />
      <Route path="/product/:productId" element={<ProductDetailPage />} />
    </Routes>
  </Router>
);

export default App;
