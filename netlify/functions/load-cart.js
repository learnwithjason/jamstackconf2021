import { sendShopifyStorefrontRequest } from './create-cart.js';

export async function handler(event) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'TODO' }),
  };
}
