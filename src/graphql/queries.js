export const PRODUCTS_QUERY = `
  query Products {
    products(first: 10) {
      edges {
        node {
          id
          title
          description
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                priceV2 {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`; 
// products(first: 10) là một phần của query để lấy 10 sản phẩm từ Shopify API