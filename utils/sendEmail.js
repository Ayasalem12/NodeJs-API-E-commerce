const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'E-Shop <' + process.env.EMAIL_USER + '>',
    to: options.email,
    subject: options.subject,
    
  };

  // 3) Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
