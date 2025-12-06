import nodemailer from "nodemailer";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { firstName, lastName, email, phone, message } = JSON.parse(
      event.body
    );

    const transporter = nodemailer.createTransport({
      service: "gmail", // you can also use SMTP
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"MIT Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // <-- your inbox
      replyTo: email, // so you can reply directly
      subject: `New message from ${firstName} ${lastName}`,
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${firstName} ${lastName}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Message:</b><br/>${message}</p>
      `,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Email sent!" }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
