import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://scandiweb-backend.42web.io/graphql", // Production backend URL
  cache: new InMemoryCache(),
});

export default client;
