import fetch from 'node-fetch';

async function sendFaunaRequest({ query, variables }) {
  const result = await fetch('https://graphql.fauna.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FAUNA_SERVER_KEY}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!result.ok) {
    console.error(result);
    return {
      statusCode: result.status,
      body: 'Error sending request to Fauna.',
    };
  }

  const { data, errors } = await result.json();

  console.log(errors);
  return data;
}

async function getClaimByEmail(email) {
  const { claim, count } = await sendFaunaRequest({
    query: `
      query GetClaimByEmail ($email: String!) {
        claim: getClaimByEmail(email: $email) {
          couponCode
        }
        count: getClaimCount
      }
    `,
    variables: { email },
  });

  return { couponCode: claim?.couponCode, count };
}

async function createClaim(email) {
  const data = await sendFaunaRequest({
    query: `
      mutation CreateClaim($email: String!) {
        claim: createClaim(email: $email, couponCode: "JAMSLAP") {
          email
          couponCode
        }
      }
    `,
    variables: { email },
  });

  console.log({ data });

  return { couponCode: data.claim?.couponCode };
}

async function getRegistrationByEmail(email) {
  const result = await fetch(
    `https://api.tito.io/v3/netlify/jamstack-conf-2021/registrations?search[q]=${email}`,
    {
      headers: {
        Authorization: `Token ${process.env.TITO_SECRET_KEY}`,
        Accept: 'application/json',
      },
    },
  );

  if (!result.ok) {
    console.error(result);
    return {
      statusCode: result.status,
      body: 'Error loading registration from Tito.',
    };
  }

  const { registrations } = await result.json();

  // some folks registered more than once; just grab the first one
  return registrations[0];
}

async function sendShopifyRequest({ query, variables }) {
  const result = await fetch(
    'https://netlify.myshopify.com/admin/api/2021-10/graphql.json',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_PASSWORD,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    },
  );

  if (!result.ok) {
    console.error(result);
    return {
      statusCode: result.status,
      body: 'Error sending request to Shopify.',
    };
  }

  const { data } = await result.json();

  return data;
}

async function loadOrCreateShopifyCustomer(email) {
  // Try to create a new customer first
  const { customerCreate } = await sendShopifyRequest({
    query: `
      mutation CreateShopifyCustomer($email: String) {
        customerCreate(input: {
          email: $email,
          tags: ["jamslap"]
        }) {
          customer {
            id
            email
            tags
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    variables: { email },
  });

  if (customerCreate && customerCreate.customer) {
    return customerCreate.customer;
  }

  // If we get here, the customer already exists; look up the ID and update them!
  const { customers } = await sendShopifyRequest({
    query: `
      query GetShopifyCustomerByEmail($query: String) {
        customers(first: 1, query: $query) {
          edges {
            customer: node {
              id
              email
              tags
            }
          }
        }
      }
    `,
    variables: { query: `email:${email}` },
  });

  if (customers.edges.length < 1) {
    return false;
  }

  const { customer } = customers.edges[0];

  const { customerUpdate } = await sendShopifyRequest({
    query: `
      mutation UpdateShopifyCustomer($id: ID) {
        customerUpdate(input: {
          id: $id,
          tags: ["jamslap"]
        }) {
          customer {
            id
            email
            tags
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    variables: { id: customer.id },
  });

  if (customerUpdate && customerUpdate.customer) {
    return customerUpdate.customer;
  }

  // if we got here, something went wrong
  return false;
}

export async function handler(event) {
  const { email } = JSON.parse(event.body);

  // 1. Check Fauna for an existing claim and get total claim count
  const { couponCode, count } = await getClaimByEmail(email);

  // 2. If a claim exists, return the discount code
  if (couponCode) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ couponCode }),
    };
  }

  // 3. If 1,000 claims have been made, return an error
  if (count >= 1000) {
    return {
      statusCode: 503,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message:
          'Unfortunately, you were not one of the first 1,000 people to claim a slap bracelet.',
      }),
    };
  }

  // 4. If not, get the Tito registration for the email
  const registration = await getRegistrationByEmail(email);

  // 5. If no registration exists, return an error
  if (!registration) {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message:
          'The provided email was not registered to attend Jamstack Conf.',
      }),
    };
  }

  // 6. Associate this email with a Shopify discount code for the bracelet
  const customer = await loadOrCreateShopifyCustomer(email);

  if (customer === false) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'There was an issue updating Shopify. Please try again.',
      }),
    };
  }

  // 7. Store the claim in Fauna with the email/coupon code
  const claim = await createClaim(email);

  // 8. Return the coupon code
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ couponCode: claim.couponCode }),
  };
}
