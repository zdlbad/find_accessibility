const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(email, url) {
    this.to = email;
    this.url = url;
    this.from = 'Swivel Tech Team';
  }

  async send() {
    const transporter = nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: '0ecd930915f0d7',
        pass: 'f678bd44082f92',
      },
    });

    const mailOption = {
      from: this.from,
      to: this.to,
      subject: 'Password Reset',
      text: ` this is your reset password link: ${this.url}`,
    };

    await transporter.sendMail(mailOption);
  }
};
