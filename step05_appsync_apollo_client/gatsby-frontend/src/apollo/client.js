import fetch from "cross-fetch"
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client"

export const client = new ApolloClient({
  link: new HttpLink({
    uri:
      "https://wdk4gq35qjewnhajcbpezu4jci.appsync-api.us-east-1.amazonaws.com/graphql", // ENTER YOUR GRAPHQL ENDPOINT HERE
    fetch,
    headers: {
      "x-api-key": "da2-oyjky7xr6baxto75lmm56tbgfm", // ENTER YOUR API KEY HERE
    },
  }),
  cache: new InMemoryCache(),
})