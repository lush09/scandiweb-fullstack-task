import { ApolloClient, InMemoryCache } from "@apollo/client";

const apiUrl = import.meta.env.VITE_GRAPHQL_API || "NO_ENV_SET";
console.log("GraphQL API endpoint in use:", apiUrl);

const client = new ApolloClient({
  uri: apiUrl,
  cache: new InMemoryCache(),
});

export default client;
