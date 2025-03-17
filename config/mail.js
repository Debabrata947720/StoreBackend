const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();


const transporter = nodemailer.createTransport({
    service: "gmail", 
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD, // Your Gmail App Password
    },
});


/**
 * Send Email Verification OTP
 * @param {string} email - Recipient's email
 * @param {string} name - Recipient's name
 * @param {string} otp - The OTP code
 * @param {string} actionUrl - The URL where the user should verify OTP
 */
const sendVerificationEmail = async (email, name, otp, actionUrl) => {
    const mailOptions = {
        from: '"No Reply | PDF Store" ',
        to: email,
        subject: "Verify Your Email - OTP Code",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background: #f9f9f9;">
                <h2 style="color: #333;">Hi ${name},</h2>
                <p style="font-size: 16px; color: #555;">Please verify your email address using the code below.</p>
                
                <div style="background: #fff; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #ddd;">
                    <p style="font-size: 18px; color: #333;">Your verification code:</p>
                    <p style="font-size: 22px; font-weight: bold; color: #d9534f; margin: 10px 0;">${otp}</p>
                </div>

                <p style="text-align: center; margin: 20px 0;">
                    <a href="${actionUrl}" style="background: #007bff; color: white; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-size: 16px;">
                        Verify Email
                    </a>
                </p>

                <p style="font-size: 14px; color: #777;">This code will expire in <strong>5 minutes</strong>. If you didn’t request this, you can ignore this email.</p>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">

                <p style="font-size: 12px; text-align: center; color: #999;">
                    Need help? Contact us at <a href="mailto:support@example.com">support@example.com</a><br>
                    &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Verification email sent to ${email}`);
        return true;
    } catch (error) {
        console.error("❌ Email sending error:", error);
        return false;
    }
};

// Export as CommonJS
module.exports = { sendVerificationEmail };
