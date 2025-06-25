import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_PRODUCT_DETAIL } from "../graphql/queries";
import "./ProductDetailPage.css";
import { useCart } from "../context/CartContext";
import { parseHtmlToReact } from "../utils/parseHtmlToReact";
import CartOverlay from "../components/CartOverlay";

function toKebabCase(str: string) {
  return (
    str &&
    str
      .replace(/[^a-zA-Z0-9]+/g, "-") // replace spaces and special chars with dash
      .replace(/^-+|-+$/g, "")        // trim leading/trailing dashes
      .toLowerCase()
  );
}

const ProductDetailPage: React.FC = () => {
  const { productId = "" } = useParams();
  const { data, loading, error } = useQuery(GET_PRODUCT_DETAIL, {
    variables: { id: productId },
  });
  const { addToCart, cartItems } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedAttributes, setSelectedAttributes] = useState<{
    [attrName: string]: string;
  }>({});
  const [cartOverlayOpen, setCartOverlayOpen] = useState(false);

  if (loading)
    return (
      <main className="product-detail-main">
        <div className="container">
          <h2>Loading...</h2>
        </div>
      </main>
    );
  if (error || !data?.product)
    return (
      <main className="product-detail-main">
        <div className="container">
          <h2>Product not found</h2>
        </div>
      </main>
    );

  const product = data.product;
  const gallery = product.gallery || [];

  let colorItems =
    product.attributes.find((a: any) => a.name.toLowerCase() === "color")
      ?.items || [];
  colorItems = Array.from(
    new Map(colorItems.map((item: any) => [item.value, item])).values(),
  );
  const price = product.prices[0]
    ? `${product.prices[0].currency} ${product.prices[0].amount}`
    : "";
  const description = product.description;

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart({
      id: product.id,
      name: product.name,
      price,
      attributes: selectedAttributes, // store all selected attributes
      image: gallery[0],
      quantity: 1,
    });
    setCartOverlayOpen(true);
    setTimeout(() => setCartOverlayOpen(false), 2000);
  };

  return (
    <main className="product-detail-main">
      <CartOverlay
        isOpen={cartOverlayOpen}
        onClose={() => setCartOverlayOpen(false)}
        items={cartItems}
      />
      <div className="container">
        <div className="product-detail-container">
          {/* Left: Gallery */}
          <div className="product-gallery">
            <div
              className="gallery-thumbnails"
              style={{
                maxHeight: "420px",
                overflowY: gallery.length > 5 ? "auto" : "visible",
              }}
              data-testid="product-gallery"
            >
              {gallery.map((img: string, idx: number) => (
                <img
                  key={idx}
                  src={img}
                  alt={`thumb-${idx}`}
                  className={`gallery-thumb${selectedImage === idx ? " active" : ""}`}
                  onClick={() => setSelectedImage(idx)}
                  style={{
                    height: "75px",
                    width: "75px",
                    objectFit: "cover",
                    marginBottom: 8,
                  }}
                />
              ))}
            </div>
            <div className="gallery-main-image-wrapper">
              <button
                className="gallery-arrow left"
                onClick={() =>
                  setSelectedImage((prev) =>
                    prev > 0 ? prev - 1 : gallery.length - 1,
                  )
                }
                aria-label="Previous image"
              >
                &#60;
              </button>
              <img
                src={gallery[selectedImage]}
                alt="main"
                className="gallery-main-image"
              />
              <button
                className="gallery-arrow right"
                onClick={() =>
                  setSelectedImage((prev) =>
                    prev < gallery.length - 1 ? prev + 1 : 0,
                  )
                }
                aria-label="Next image"
              >
                &#62;
              </button>
            </div>
          </div>
          <div className="product-info-panel">
            <h2 className="product-detail-title">{product.name}</h2>
            {(() => {
              const uniqueAttributes = product.attributes
                ? product.attributes.filter(
                    (attr: any, idx: number, self: any[]) =>
                      idx === self.findIndex((a) => a.id === attr.id),
                  )
                : [];
              return uniqueAttributes.map((attr: any) => {
                if (
                  attr.type === "swatch" ||
                  attr.name.toLowerCase() === "color"
                ) {
                  return (
                    <React.Fragment key={attr.id}>
                      <div className="product-attr-label">
                        {attr.name.toUpperCase()}:
                      </div>
                      <div
                        className="product-color-selector"
                        data-testid="product-attribute-color"
                      >
                        {attr.items.map((item: any, idx: number) => (
                          <button
                            data-testid={`product-attribute-color-${item.value}`}
                            key={item.id || item.value + "-" + idx}
                            className={`color-btn${selectedAttributes[attr.name] === item.value ? " selected" : ""}`}
                            style={{
                              background: item.value,
                              border:
                                item.value === "#fff"
                                  ? "1px solid #A6A6A6"
                                  : "none",
                            }}
                            onClick={() =>
                              setSelectedAttributes((prev) => ({
                                ...prev,
                                [attr.name]: item.value,
                              }))
                            }
                          />
                        ))}
                      </div>
                    </React.Fragment>
                  );
                } else {
                  const maxLen = Math.max(
                    ...attr.items.map((item: any) => String(item.value).length),
                  );
                  const btnWidth = `${maxLen * 0.6 + 2}em`;
                  return (
                    <React.Fragment key={attr.id}>
                      <div className="product-attr-label">
                        {attr.name.toUpperCase()}:
                      </div>
                      <div
                        className="product-size-selector"
                        data-testid={`product-attribute-${toKebabCase(attr.name)}`}
                      >
                        {attr.items.map((item: any, idx: number) => (
                          <button
                            key={`${attr.id}-${item.value}-${idx}`}
                            className={`attr-btn${selectedAttributes[attr.name] === item.value ? " selected" : ""}`}
                            style={{ width: btnWidth }}
                            data-testid={`product-attribute-${toKebabCase(attr.name)}-${item.value}`}
                            onClick={() =>
                              setSelectedAttributes((prev) => ({
                                ...prev,
                                [attr.name]: item.value,
                              }))
                            }
                          >
                            {item.value}
                          </button>
                        ))}
                      </div>
                    </React.Fragment>
                  );
                }
              });
            })()}

            <div className="product-attr-label">PRICE:</div>
            <div className="product-detail-price">{price}</div>
            <button
              className="product-detail-add-btn"
              data-testid="add-to-cart"
              onClick={handleAddToCart}
              disabled={
                !product.inStock ||
                (product.attributes && product.attributes.some((attr: { name: string }) => !selectedAttributes[attr.name]))
              }
              style={
                !product.inStock ||
                (product.attributes && product.attributes.some((attr: { name: string }) => !selectedAttributes[attr.name]))
                  ? { opacity: 0.5, cursor: "not-allowed" }
                  : {}
              }
            >
              {product.inStock ? "ADD TO CART" : "OUT OF STOCK"}
            </button>
            <div
              className="product-detail-description"
              data-testid="product-description"
            >
              {parseHtmlToReact(description)}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetailPage;
