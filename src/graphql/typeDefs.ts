const typeDefs = `#graphql
  scalar JSON
  scalar DateTime

  type Property {
    id: ID!
    street: String!
    city: String!
    state: String!
    zipCode: String!
    lat: Float
    long: Float
    weatherData: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum SortOrder {
    asc
    desc
  }

  input PropertyFilter {
    city: String
    state: String
    zipCode: String
  }

  input CreatePropertyInput {
    street: String!
    city: String!
    state: String!
    zipCode: String!
  }

  type Query {
    properties(
      filter: PropertyFilter
      sortByCreatedAt: SortOrder
      """Maximum number of results to return (default: 50, max: 200)"""
      limit: Int
      """Number of results to skip for pagination (default: 0)"""
      offset: Int
    ): [Property!]!
    property(id: ID!): Property
  }

  type Mutation {
    createProperty(input: CreatePropertyInput!): Property!
    deleteProperty(id: ID!): Property
  }
`;

export default typeDefs;
