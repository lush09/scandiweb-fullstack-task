import React from "react";
import "../index.css";
import { useNavigate } from "react-router-dom";
import addToCartIcon from "../assets/cart-btn.png";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  highlight?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, highlight }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [cartOverlayOpen, setCartOverlayOpen] = React.useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".add-to-cart-btn")) return;
    navigate(`/product/${product.id}`);
  };

  function toKebabCase(str: string) {
    return (
      str &&
      str
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase()
    );
  }

  const handleQuickAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Pick default (first) values for all attributes
    const defaultAttributes: { [attrName: string]: string } = {};
    product.attributes.forEach((attr) => {
      if (attr.items && attr.items.length > 0) {
        defaultAttributes[attr.name] = attr.items[0].value;
      }
    });
    const price = product.prices[0]
      ? `${product.prices[0].currency.symbol || product.prices[0].currency} ${product.prices[0].amount}`
      : "";
    addToCart({
      id: product.id,
      name: product.name,
      price,
      attributes: defaultAttributes,
      image: product.gallery[0],
      quantity: 1,
    });
    setCartOverlayOpen(true);
    setTimeout(() => setCartOverlayOpen(false), 2000); // auto-close overlay after 2s
  };

  return (
    <div
      className={`product-card${highlight ? " active" : ""}${!product.inStock ? " out-of-stock" : ""}`}
      onClick={handleCardClick}
      style={{ cursor: "pointer", position: "relative" }}
      data-testid={`product-${toKebabCase(product.name)}`}
    >
      <div className="product-image-wrapper">
        <img
          src={product.gallery[0]}
          alt={product.name}
          className="product-image"
        />
        {!product.inStock && (
          <div className="out-of-stock-overlay">OUT OF STOCK</div>
        )}
      </div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-price">
          {product.prices[0]
            ? `${product.prices[0].currency.symbol || product.prices[0].currency} ${product.prices[0].amount}`
            : ""}
        </div>
      </div>
      {product.inStock && (
        <button
          className="add-to-cart-btn"
          onClick={handleQuickAddToCart}
          aria-label="Quick add to cart"
        >
          <img src={addToCartIcon} alt="Add to Cart" />
        </button>
      )}
      {/* Optionally show a visual feedback for quick add */}
      {cartOverlayOpen && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(94,206,123,0.15)",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            fontWeight: 700,
            fontSize: 22,
            color: "#5ece7b",
          }}
        >
          Added!
        </div>
      )}
    </div>
  );
};

export default ProductCard;
