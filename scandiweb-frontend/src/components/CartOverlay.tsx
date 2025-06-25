import React from "react";
import "./CartOverlay.css";
import { useCart } from "../context/CartContext";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS_BY_CATEGORY } from "../graphql/queries";

export interface CartItem {
  id: string;
  name: string;
  price: string;
  attributes: { [attrName: string]: string };
  image: string;
  quantity: number;
}

interface CartOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
}

function toKebabCase(str: string) {
  return (
    str &&
    str
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/\s+/g, "-")
      .replace(/_+/g, "-")
      .replace(/[^a-zA-Z0-9-]/g, "")
      .toLowerCase()
  );
}

const CartOverlay: React.FC<CartOverlayProps> = ({
  isOpen,
  onClose,
  items,
}) => {
  const { updateQuantity, removeFromCart } = useCart();
  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isOpen]);
  // For demo, fetch all products in the 'all' category (could be optimized to fetch only needed products)
  const { data: productsData } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: { categoryId: "all" },
    skip: !isOpen,
  });
  const products = productsData?.products || [];

  if (!isOpen) return null; // Unmount overlay so it is truly hidden
  const total = items.reduce(
    (acc, item) =>
      acc + parseFloat(item.price.replace(/[^\d.]/g, "")) * item.quantity,
    0,
  );

  // Helper to get unique key for cart item (id + all attribute values)
  const getCartKey = (item: CartItem) => {
    const attrKey = item.attributes
      ? Object.entries(item.attributes)
          .map(([k, v]) => `${k}:${v}`)
          .join("|")
      : "";
    return `${item.id}|${attrKey}`;
  };

  const handleQtyChange = (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      removeFromCart(item.id, item.attributes);
    } else {
      updateQuantity(item.id, newQty, item.attributes);
    }
  };

  return (
    <div className="cart-overlay-backdrop" onClick={onClose}>
      <div className="cart-overlay" data-testid="cart-overlay" onClick={(e) => e.stopPropagation()}>
        <button className="cart-overlay-close" onClick={onClose}>
          &times;
        </button>
        <div className="cart-overlay-title">
          My Bag,{" "}
          <span>
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </div>
        <div className="cart-overlay-items">
          {items.map((item) => (
            <div key={getCartKey(item)} className="cart-overlay-item">
              <img
                src={item.image}
                alt={item.name}
                className="cart-overlay-item-img"
              />
              <div className="cart-overlay-item-info">
                <div className="cart-overlay-item-name">{item.name}</div>
                <div className="cart-overlay-item-price">{item.price}</div>
                <div className="cart-overlay-item-attr">
                  {/* Show all available attributes for this product, highlighting selected */}
                  {(() => {
                    const product = products.find((p: any) => p.id === item.id);
                    if (!product) return null;
                    const uniqueAttributes = product.attributes
                      ? product.attributes.filter(
                          (attr: any, idx: number, self: any[]) =>
                            idx === self.findIndex((a) => a.id === attr.id),
                        )
                      : [];
                    const attributeNodes = uniqueAttributes.map((attr: any) => {
                      const attrKebab = toKebabCase(attr.name);
                      return (
                        <div
                          key={attr.id}
                          style={{ marginBottom: 4 }}
                          data-testid={`cart-item-attribute-${attrKebab}`}
                        >
                          <span style={{ fontWeight: 600 }}>{attr.name}:</span>{" "}
                          <span className="cart-overlay-attr-options">
                            {attr.items.map((opt: any) => {
                              const optKebab = toKebabCase(opt.value);
                              const isSelected =
                                item.attributes &&
                                item.attributes[attr.name] === opt.value;
                              const baseTestId = `cart-item-attribute-${attrKebab}-${optKebab}`;
                              const testId = isSelected
                                ? `${baseTestId}-selected`
                                : baseTestId;
                              if (
                                attr.type === "swatch" ||
                                attr.name.toLowerCase() === "color"
                              ) {
                                return (
                                  <span
                                    key={opt.id}
                                    title={opt.display_value || opt.value}
                                    style={{
                                      background: opt.value,
                                      display: "inline-block",
                                      width: 18,
                                      height: 18,
                                      borderRadius: 3,
                                      border: isSelected
                                        ? "2px solid #5ece7b"
                                        : "1px solid #ccc",
                                      marginLeft: 2,
                                      boxShadow: isSelected
                                        ? "0 0 0 2px #5ece7b"
                                        : undefined,
                                      outline: isSelected
                                        ? "2px solid #5ece7b"
                                        : undefined,
                                    }}
                                    data-testid={testId}
                                  />
                                );
                              } else {
                                return (
                                  <span
                                    key={opt.id}
                                    style={{
                                      padding: "2px 8px",
                                      border: isSelected
                                        ? "2px solid #5ece7b"
                                        : "1px solid #ccc",
                                      background: isSelected
                                        ? "#5ece7b"
                                        : "#fff",
                                      color: isSelected ? "#fff" : "#1d1f22",
                                      borderRadius: 3,
                                      marginLeft: 2,
                                    }}
                                    data-testid={testId}
                                  >
                                    {opt.value}
                                  </span>
                                );
                              }
                            })}
                          </span>
                        </div>
                      );
                    });
                    return attributeNodes;
                  })()}
                </div>
                <div className="cart-overlay-item-qty-controls">
                  <button
                    className="cart-overlay-qty-arrow"
                    aria-label="Decrease quantity"
                    onClick={() => handleQtyChange(item, -1)}
                    data-testid="cart-item-amount-decrease"
                  >
                    &#8722;
                  </button>
                  <span
                    className="cart-overlay-item-qty"
                    style={{ color: "#000" }}
                    data-testid="cart-item-amount"
                  >
                    {item.quantity}
                  </span>
                  <button
                    className="cart-overlay-qty-arrow"
                    aria-label="Increase quantity"
                    onClick={() => handleQtyChange(item, 1)}
                    data-testid="cart-item-amount-increase"
                  >
                    &#43;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-overlay-total-row" data-testid="cart-total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <button
  className="cart-overlay-place-order"
  data-testid="place-order"
  disabled={items.length === 0}
  style={items.length === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
  onClick={() => {
    if (items.length === 0) return;
    // TODO: Call GraphQL mutation to insert order here
    // For now, just clear the cart
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('cart');
      window.location.reload(); // or ideally use your cart context's clearCart()
    }
  }}
>
  PLACE ORDER
</button>
      </div>
    </div>
  );
};

export default CartOverlay;
