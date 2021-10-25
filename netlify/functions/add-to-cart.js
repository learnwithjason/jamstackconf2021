import { sendShopifyStorefrontRequest } from './create-cart.js';

/*
      mutation AddToCart($cartId: ID!, $variantId: ID!) {
        cartLinesAdd(cartId: $cartId, lines: [{ quantity: 1, merchandiseId: $variantId}]) {
          cart {
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      product {
                        title
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
*/

export async function handler(event) {
  const { cartId, variantId } = JSON.parse(event.body);

  const data = await sendShopifyStorefrontRequest({
    query: `
      mutation AddToCart($cartId: ID!, $variantId: ID!) {
        cartLinesAdd(cartId: $cartId, lines: [{ quantity: 1, merchandiseId: $variantId}]) {
          cart {
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      product {
                        title
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: { cartId, variantId },
  });

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
}
