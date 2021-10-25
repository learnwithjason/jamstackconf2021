import fetch from 'node-fetch';

export async function sendShopifyStorefrontRequest({ query, variables }) {
  const result = await fetch(
    'https://netlify.myshopify.com/api/2021-10/graphql.json',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token':
          process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    },
  );

  if (!result.ok) {
    console.error(result);
    return false;
  }

  const { data } = await result.json();

  return data;
}

export async function handler() {
  const data = await sendShopifyStorefrontRequest({
    query: `
      mutation CreateCart {
        cartCreate {
          cart {
            checkoutUrl
            id
          }
        }
      }
    `,
    variables: {},
  });

  if (!data) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'There was a problem creating a cart.' }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      cartId: data.cartCreate?.cart?.id,
      checkoutUrl: data.cartCreate?.cart?.checkoutUrl,
    }),
  };
}
