
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmailOTP({ email, first_name, last_name, otp }) {
    const fullName = `${first_name || ''} ${last_name || ''}`.trim();

    const mailOptions = {
      from: `"Niboscule Tshirts" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Registration OTP - Your Store',

      text: `
Hello ${fullName || 'Customer'},

Your OTP for registration is ${otp}.

This OTP is valid for 10 minutes.

Please do not share this OTP with anyone.

Regards,
Niboscule Tshirts
      `,

      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:20px;background:#f4f4f4;
                     font-family:Arial,sans-serif;">

          <div style="max-width:500px;margin:auto;background:#ffffff;
                      padding:30px;border-radius:10px;">

            <h2 style="color:#222;text-align:center;">
              Verify Your Email
            </h2>

            <p>Hello ${fullName || 'Customer'},</p>

            <p>
              Thank you for registering with Your Store.
              Please use the OTP below to verify your email address.
            </p>

            <div style="background:#f2f2f2;padding:20px;
                        text-align:center;border-radius:8px;
                        margin:25px 0;">

              <h1 style="letter-spacing:8px;color:#2563eb;
                         margin:0;">
                ${otp}
              </h1>

            </div>

            <p style="color:#555;">
              This OTP is valid for <b>10 minutes</b>.
            </p>

            <p style="color:#d9534f;">
              Please do not share this OTP with anyone.
            </p>

            <hr />

            <p style="font-size:12px;color:#888;text-align:center;">
              © ${new Date().getFullYear()} Your Store.
              All rights reserved.
            </p>

          </div>

        </body>
        </html>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      console.error('Email OTP Error:', error);

      throw new Error('Failed to send email OTP');
    }
  }
}

module.exports = new EmailService();
