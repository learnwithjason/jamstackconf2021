import mail from '@sendgrid/mail';

mail.setApiKey(process.env.SENDGRID_API_KEY);

export async function handler() {
  try {
    await mail.send({
      to: 'jason@lengstorf.com',
      from: 'Jamstack Conf Swag <noreply@jamstackconf.com>',
      subject: 'Does this Just Work™?',
      text: 'I sure hope so!',
      html: 'I sure <em>hope</em> so!',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'email sent' }),
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 200,
      body: JSON.stringify(error),
    };
  }
}
