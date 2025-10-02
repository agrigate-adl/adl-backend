const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.COMPANY_EMAIL,
        pass: process.env.COMPANY_PASSWORD,
      },
    });
  }

  // Send OTP via Email
  async sendOTPEmail(name, email, otp) {
    const mailOptions = {
      from: process.env.COMPANY_EMAIL,
      to: email,
      subject: "Your Agrigate Login Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4CAF50; margin: 0;">Agrigate</h1>
              <p style="color: #666; margin: 5px 0;">Agricultural Technology Platform</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              You requested to log into your Agrigate account. Please use the verification code below:
            </p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <h1 style="color: #4CAF50; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: monospace;">${otp}</h1>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                ⏰ <strong>Important:</strong> This code will expire in <strong>10 minutes</strong>.
              </p>
            </div>
            
            <p style="color: #555; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
              If you didn't request this verification code, please ignore this email and ensure your account is secure.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Agrigate Company Limited</p>
              <p>Agricultural Technology Solutions</p>
            </div>
          </div>
        </div>
      `,
      text: `
        Hello ${name},
        
        Your Agrigate login verification code is: ${otp}
        
        This code will expire in 10 minutes.
        
        If you didn't request this code, please ignore this email.
        
        Best regards,
        Agrigate Team
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("OTP Email sent successfully:", info.response);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Error sending OTP email:", error);
      throw error;
    }
  }

  // Enhanced Password Reset Email
  async sendPasswordResetEmail(name, email, newPassword) {
    const mailOptions = {
      from: process.env.COMPANY_EMAIL,
      to: email,
      subject: "Your Agrigate Account Password Has Been Reset",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4CAF50; margin: 0;">Agrigate</h1>
              <p style="color: #666; margin: 5px 0;">Agricultural Technology Platform</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Your account password has been reset by an administrator. Your new login credentials are:
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #4CAF50; margin: 20px 0;">
              <p style="margin: 0; color: #333;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 10px 0 0 0; color: #333;"><strong>New Password:</strong> <code style="background-color: #e9ecef; padding: 2px 5px; border-radius: 3px;">${newPassword}</code></p>
            </div>
            
            <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #0c5460; margin: 0; font-size: 14px;">
                🔒 <strong>Security Recommendation:</strong> Please log in and change your password immediately for security purposes.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #555; margin-bottom: 15px;">Need help? Contact our support team.</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Agrigate Company Limited</p>
              <p>Agricultural Technology Solutions</p>
            </div>
          </div>
        </div>
      `,
      text: `
        Hello ${name},
        
        Your password has been reset by an administrator.
        
        Your new login credentials are:
        Email: ${email}
        New Password: ${newPassword}
        
        Please login and change your password for security.
        
        Best regards,
        Agrigate Team
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Password reset email sent successfully:", info.response);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  }

  // Enhanced Agent Registration Email
  async sendAgentRegistrationEmail(name, email, password) {
    const mailOptions = {
      from: process.env.COMPANY_EMAIL,
      to: email,
      subject: "Welcome to Agrigate - Your Agent Account Has Been Created",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4CAF50; margin: 0;">Welcome to Agrigate!</h1>
              <p style="color: #666; margin: 5px 0;">Agricultural Technology Platform</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Congratulations! You have been registered as an Agent on the <strong>Agrigate</strong> platform. 
              We're excited to have you join our agricultural technology community.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #4CAF50; margin: 20px 0;">
              <h3 style="color: #333; margin: 0 0 15px 0;">Your Login Credentials:</h3>
              <p style="margin: 0; color: #333;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 10px 0 0 0; color: #333;"><strong>Password:</strong> <code style="background-color: #e9ecef; padding: 2px 5px; border-radius: 3px;">${password}</code></p>
            </div>
            
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #155724; margin: 0; font-size: 14px;">
                🌱 <strong>Next Steps:</strong>
                <br>• Download the Agrigate mobile app
                <br>• Log in using your credentials above
                <br>• Complete your profile setup
                <br>• Start connecting with farmers in your area
              </p>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                🔒 <strong>Security Tip:</strong> For your account security, we recommend changing your password after your first login.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #555; margin-bottom: 15px;">Welcome to the future of agriculture!</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Agrigate Company Limited</p>
              <p>Agricultural Technology Solutions</p>
              <p>Questions? Contact our support team</p>
            </div>
          </div>
        </div>
      `,
      text: `
        Hello ${name},
        
        You have been registered as an Agent on the AGRIGATE COMPANY LIMITED platform.
        
        Your login credentials are:
        Email: ${email}
        Password: ${password}
        
        Please download the mobile app and log in to get started.
        
        Welcome to Agrigate!
        
        Best regards,
        Agrigate Team
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Agent registration email sent successfully:", info.response);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Error sending agent registration email:", error);
      throw error;
    }
  }

  // Test email connection
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log("✅ Email service connection verified successfully");
      return { success: true, message: "Email service connected" };
    } catch (error) {
      console.error("❌ Email service connection failed:", error);
      throw error;
    }
  }
}

module.exports = new EmailService();
