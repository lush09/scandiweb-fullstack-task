import { gql } from '@apollo/client';

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory($categoryId: String!) {
    products(categoryId: $categoryId) {
      id
      name
      brand
      inStock
      gallery
      description
      category_id
      prices {
        currency
        amount
      }
      attributes {
        id
        name
        type
        items {
          id
          value
          display_value
        }
      }
    }
  }
`;

export const GET_PRODUCT_DETAIL = gql`
  query GetProductDetail($id: String!) {
    product(id: $id) {
      id
      name
      brand
      inStock
      gallery
      description
      category_id
      prices {
        currency
        amount
      }
      attributes {
        id
        name
        type
        items {
          id
          value
          display_value
        }
      }
    }
  }
`;
