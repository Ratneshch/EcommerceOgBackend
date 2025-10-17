// utils/emailTemplate.js
const Verification_Email_Template = `
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 10px;">
      <h2>Welcome to Unipolar!</h2>
      <p>Your OTP is: <b>{otp}</b></p>
      <p>This OTP will expire in 10 minutes.</p>
    </div>
  </body>
</html>
`;

module.exports = Verification_Email_Template; 
