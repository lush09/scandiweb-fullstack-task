import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

// MySQL connection
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
};

// CORS setup to allow only Vercel frontend
const allowedOrigins = [
  "https://scandiweb-fullstack-task-snf4.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};

const app = express();
app.use(cors(corsOptions));

// Example schema matching your frontend's needs
const typeDefs = gql`
  type Query {
    hello: String
    categories: [Category]
    products(categoryId: String!): [Product]
    product(id: String!): Product
  }

  type Category {
    id: ID!
    name: String!
  }

  type Product {
    id: ID!
    name: String!
    brand: String!
    inStock: Boolean!
    gallery: [String!]!
    description: String!
    category_id: String!
    prices: [Price!]!
    attributes: [Attribute!]!
  }

  type Price {
    currency: String!
    amount: Float!
  }

  type Attribute {
    id: ID!
    name: String!
    type: String!
    items: [AttributeItem!]!
  }

  type AttributeItem {
    id: ID!
    value: String!
    display_value: String
  }
`;

const resolvers = {
  Query: {
    hello: () => "Hello from GraphQL backend!",
    categories: async () => {
      const conn = await mysql.createConnection(dbConfig);
      const [rows] = await conn.execute("SELECT id, name FROM categories");
      await conn.end();
      return rows;
    },
    // Enhanced products resolver to support 'all' category and correct categoryId matching
    products: async (_, { categoryId }) => {
      const conn = await mysql.createConnection(dbConfig);
      let rows;
      // If 'all' category or id '1' is requested, return all products
      if (categoryId === "1" || categoryId === "all") {
        [rows] = await conn.execute("SELECT * FROM products");
      } else {
        [rows] = await conn.execute("SELECT * FROM products WHERE category_id = ?", [categoryId]);
      }
      await conn.end();
      // Map in_stock to inStock for GraphQL
      // Helper to fetch prices for a product
      async function getPricesForProduct(productId) {
        const conn = await mysql.createConnection(dbConfig);
        const [prices] = await conn.execute(
          "SELECT currency, amount FROM prices WHERE product_id = ?",
          [productId]
        );
        await conn.end();
        return prices;
      }

      // Helper to fetch attributes (and items) for a product
      async function getAttributesForProduct(productId) {
        const conn = await mysql.createConnection(dbConfig);
        // Get attributes for the product
        const [attributes] = await conn.execute(
          `SELECT a.id, a.name, a.type
           FROM attributes a
           JOIN product_attributes pa ON pa.attribute_id = a.id
           WHERE pa.product_id = ?`,
          [productId]
        );
        // For each attribute, get its items
        for (const attr of attributes) {
          const [items] = await conn.execute(
            `SELECT ai.id, ai.value, ai.display_value
             FROM attribute_items ai
             WHERE ai.attribute_id = ?`,
            [attr.id]
          );
          attr.items = items || [];
        }
        await conn.end();
        return attributes;
      }

      return await Promise.all(rows.map(async (product) => ({
        ...product,
        inStock: product.in_stock,
        gallery: typeof product.gallery === 'string' ? JSON.parse(product.gallery) : product.gallery,
        prices: await getPricesForProduct(product.id),
        attributes: await getAttributesForProduct(product.id) || [],
      })));
    },
    product: async (_, { id }) => {
      const conn = await mysql.createConnection(dbConfig);
      const [rows] = await conn.execute("SELECT * FROM products WHERE id = ?", [id]);
      await conn.end();
      if (!rows[0]) return null;
      // Helper to fetch prices for a product
      async function getPricesForProduct(productId) {
        const conn = await mysql.createConnection(dbConfig);
        const [prices] = await conn.execute(
          "SELECT currency, amount FROM prices WHERE product_id = ?",
          [productId]
        );
        await conn.end();
        return prices;
      }

      // Helper to fetch attributes (and items) for a product
      async function getAttributesForProduct(productId) {
        const conn = await mysql.createConnection(dbConfig);
        // Get attributes for the product
        const [attributes] = await conn.execute(
          `SELECT a.id, a.name, a.type
           FROM attributes a
           JOIN product_attributes pa ON pa.attribute_id = a.id
           WHERE pa.product_id = ?`,
          [productId]
        );
        // For each attribute, get its items
        for (const attr of attributes) {
          const [items] = await conn.execute(
            `SELECT ai.id, ai.value, ai.display_value
             FROM attribute_items ai
             WHERE ai.attribute_id = ?`,
            [attr.id]
          );
          attr.items = items || [];
        }
        await conn.end();
        return attributes;
      }

      return {
        ...rows[0],
        inStock: rows[0].in_stock,
        gallery: typeof rows[0].gallery === 'string' ? JSON.parse(rows[0].gallery) : rows[0].gallery,
        prices: await getPricesForProduct(rows[0].id),
        attributes: await getAttributesForProduct(rows[0].id) || [],
      };
    },
  },
};

async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  const PORT = process.env.PORT || 10000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
