import "../index.css";
import logo from "../assets/logo.png";
import CartOverlay from "./CartOverlay";
import { useCart } from "../context/CartContext";
import { useQuery } from "@apollo/client";
import { GET_CATEGORIES } from "../graphql/queries";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const { cartItems } = useCart();
  const { data } = useQuery(GET_CATEGORIES);
  const navigate = useNavigate();
  const location = useLocation();

  const handleCategoryClick = (category: string) => {
    navigate(`/category/${category.toLowerCase()}`);
  };
  const handleLogoClick = () => {
    navigate("/category/all");
  };
  const getActiveCategory = () => {
    const match = location.pathname.match(/\/category\/(\w+)/);
    return match ? match[1].toLowerCase() : "women";
  };
  const activeCategory = getActiveCategory();

  return (
    <header className="custom-header">
      <div className="container header-inner">
        <nav className="header-categories">
          {data?.categories.map((cat: { id: string; name: string }) => {
            const isActive = activeCategory === cat.name.toLowerCase();
            return (
              <a
  key={cat.id}
  href={`/category/${cat.name.toLowerCase()}` }
  className={`header-link${isActive ? " active" : ""}`}
  style={{
    background: "none",
    border: "none",
    padding: 0,
    margin: 0,
    cursor: "pointer",
    textDecoration: "none",
    
  }}
  data-testid={isActive ? "active-category-link" : "category-link"}
>
  {cat.name.toUpperCase()}
</a>
            );
          })}
        </nav>
        <div className="header-logo">
          <button
            className="logo-btn"
            onClick={handleLogoClick}
            data-testid="logo-btn"
            aria-label="Go to home"
          >
            <img src={logo} alt="Logo" />
          </button>
        </div>
        <button
          className="header-cart"
          onClick={() => setCartOpen(true)}
          data-testid="cart-btn"
          aria-label="Open cart"
          style={{ background: "none", border: "none", position: "relative", cursor: "pointer" }}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="#1D1F22"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {cartItems.length > 0 && (
            <span
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "#5ece7b",
                color: "#fff",
                borderRadius: "50%",
                width: 18,
                height: 18,
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {cartItems.length}
            </span>
          )}
        </button>
      </div>
      <CartOverlay
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
      />
    </header>
  );
};

export default Header;
