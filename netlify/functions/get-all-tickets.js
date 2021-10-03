import fetch from 'node-fetch';
import { builder } from '@netlify/functions';

const API_BASE = 'https://api.tito.io/v3';

async function getAllTickets() {
  const response = await fetch(
    `${API_BASE}/netlify/jamstack-conf-2021/tickets?per_page=20000`,
    {
      headers: {
        Authorization: `Token ${process.env.TITO_SECRET_KEY}`,
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    console.error(response);

    return {
      statusCode: response.status,
      message: 'Error loading tickets from Tito',
    };
  }

  const { tickets } = await response.json();

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tickets),
  };
}

export const handler = builder(getAllTickets);
