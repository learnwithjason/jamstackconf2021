import fetch from 'node-fetch';

export async function handler(event) {
  const { email } = JSON.parse(event.body);

  console.log({ email });

  const tickets = await fetch(`${process.env.URL}/api/get-all-tickets`).then(
    (res) => res.json(),
  );

  const ticket = tickets.find(
    (t) =>
      t.registration_email &&
      t.registration_email.toLowerCase() === email.toLowerCase(),
  );

  if (!ticket) {
    return {
      statusCode: 404,
      body: { message: 'No ticket found for the provided email.' },
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(ticket),
  };
}
