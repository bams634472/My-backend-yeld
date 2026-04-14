// Queries
export const listBusinesses = /* GraphQL */ `
  query ListBusinesses {
    listBusinesses {
      items {
        id name address category description phone website
        reviews {
          items {
            id rating text createdAt
          }
        }
      }
    }
  }
`;

export const getBusiness = /* GraphQL */ `
  query GetBusiness($id: ID!) {
    getBusiness(id: $id) {
      id name address category description phone website
      reviews {
        items {
          id rating text createdAt
        }
      }
    }
  }
`;

export const listReviews = /* GraphQL */ `
  query ListReviews {
    listReviews {
      items {
        id businessId rating text createdAt
        business { id name }
      }
    }
  }
`;

// Mutations
export const createBusiness = /* GraphQL */ `
  mutation CreateBusiness($input: CreateBusinessInput!) {
    createBusiness(input: $input) {
      id name address category description phone website
    }
  }
`;

export const deleteBusiness = /* GraphQL */ `
  mutation DeleteBusiness($input: DeleteBusinessInput!) {
    deleteBusiness(input: $input) { id }
  }
`;

export const createReview = /* GraphQL */ `
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id businessId rating text createdAt
    }
  }
`;

export const deleteReview = /* GraphQL */ `
  mutation DeleteReview($input: DeleteReviewInput!) {
    deleteReview(input: $input) { id }
  }
`;
