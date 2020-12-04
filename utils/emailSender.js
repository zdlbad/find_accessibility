const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(email, url) {
    this.to = email;
    this.url = url;
    this.from = 'Swivel Tech Team';
  }

  async send() {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth:{
        user: 'zdlbad@gmail.com',
        pass: 'Zdl@Google'
      }
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
