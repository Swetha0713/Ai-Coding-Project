const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send price drop alert email to user
 */
const sendPriceDropEmail = async (product) => {
  const { name, productURL, targetPrice, currentPrice, userEmail, platform } = product;

  const platformName = platform === 'amazon' ? 'Amazon' : platform === 'flipkart' ? 'Flipkart' : 'Store';
  const savings = (targetPrice - currentPrice).toFixed(2);

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: `🎉 Price Drop Alert! "${name}" is now ₹${currentPrice}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 26px; }
          .body { padding: 30px; }
          .price-box { display: flex; justify-content: space-around; margin: 20px 0; text-align: center; }
          .price-card { background: #f9f9f9; border-radius: 8px; padding: 15px 25px; }
          .price-card .label { font-size: 12px; color: #888; text-transform: uppercase; }
          .price-card .amount { font-size: 28px; font-weight: bold; }
          .old { color: #e74c3c; text-decoration: line-through; }
          .new { color: #27ae60; }
          .savings { background: #eafaf1; border: 1px solid #27ae60; color: #27ae60; border-radius: 6px; padding: 10px; text-align: center; margin: 15px 0; font-weight: bold; }
          .btn { display: block; width: fit-content; margin: 20px auto; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 14px 35px; border-radius: 30px; text-decoration: none; font-size: 16px; font-weight: bold; }
          .footer { background: #f4f4f4; text-align: center; padding: 15px; font-size: 12px; color: #aaa; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 AlertCart</h1>
            <p>Your Price Drop Alert Has Triggered!</p>
          </div>
          <div class="body">
            <h2>${name}</h2>
            <p>Great news! The product you're tracking on <strong>${platformName}</strong> has dropped below your target price.</p>
            <div class="price-box">
              <div class="price-card">
                <div class="label">Your Target</div>
                <div class="amount old">₹${targetPrice}</div>
              </div>
              <div style="display:flex;align-items:center;font-size:24px;">→</div>
              <div class="price-card">
                <div class="label">Current Price</div>
                <div class="amount new">₹${currentPrice}</div>
              </div>
            </div>
            <div class="savings">🎉 You save ₹${savings}!</div>
            <a href="${productURL}" class="btn">Buy Now on ${platformName}</a>
            <p style="color:#888;font-size:13px;text-align:center;">Hurry! Prices can change at any time.</p>
          </div>
          <div class="footer">
            <p>You received this because you set up a price alert on AlertCart.</p>
            <p>© ${new Date().getFullYear()} AlertCart – Price Drop Notification System</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${userEmail} for "${name}" | MessageID: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`❌ Email failed for ${userEmail}:`, err.message);
    return false;
  }
};

module.exports = { sendPriceDropEmail };
