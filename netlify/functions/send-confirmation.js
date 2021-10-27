import mail from '@sendgrid/mail';

mail.setApiKey(process.env.SENDGRID_API_KEY);

export async function handler() {
  try {
    // calculate ANYTHING
    const people = [
      {
        name: 'Jason',
        email: 'jason@lengstorf.com',
      },
      {
        name: 'LWJ Support',
        email: 'support@learnwithjason.dev',
      },
    ];

    await mail.send({
      from: 'Jamstack Conf <noreply@jamstackconf.com>',
      replyTo: 'realemail@jamstackconf.com',
      // subject: 'Someone claimed some swag!',
      // html: `
      //   <h3>Someone Claimed Jamstack Conf Swag!</h3>
      //   <p>Wow! Someone out there is lookin’ fly!</p>
      //   <p><a href="https://deploy-preview-1--jamstackconf2021-swag.netlify.app/">Check out the site</a></p>
      // `,
      templateId: 'd-92dc0cde0ac34c9a8a86ad725065212a',
      personalizations: people.map((person) => ({
        to: `${person.name} <${person.email}>`,
        dynamicTemplateData: {
          greeting:
            person.name === 'Jason'
              ? 'You’re a doofus.'
              : `Waddup ${person.name}?!`,
          somethingCool: 'Wow this was dynamic!',
        },
      })),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent.' }),
    };
  } catch (error) {
    console.log(error.response.body.errors);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error sending email.' }),
    };
  }
}
