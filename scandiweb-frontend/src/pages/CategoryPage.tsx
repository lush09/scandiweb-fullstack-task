import React from "react";
import ProductCard from "../components/ProductCard";
import "../index.css";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS_BY_CATEGORY } from "../graphql/queries";

const CategoryPage: React.FC = () => {
  const { categoryName = "women" } = useParams();
  const { data, loading, error } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: categoryName === "all" ? {} : { categoryId: categoryName },
    skip: !categoryName,
  });

  if (loading)
    return (
      <main className="category-main">
        <div className="container">
          <h2 className="category-title">Loading...</h2>
        </div>
      </main>
    );
  if (error)
    return (
      <main className="category-main">
        <div className="container">
          <h2 className="category-title">Error loading products</h2>
        </div>
      </main>
    );

  return (
    <main className="category-main">
      <div className="container">
        <h2 className="category-title">
          {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}
        </h2>
        <div className="product-grid">
          {data.products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default CategoryPage;
