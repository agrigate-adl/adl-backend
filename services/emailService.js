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

  // Send Admin Deletion Notification Email
  async sendDeletionNotificationEmail(adminEmails, deletionData) {
    const {
      adminEmail,
      adminName,
      deletionType,
      deletedItemName,
      deletedItemId,
      timestamp,
    } = deletionData;

    const formatTimestamp = (date) => {
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "full",
        timeStyle: "long",
        timeZone: "Africa/Kampala", // Uganda timezone (EAT - East Africa Time)
      }).format(new Date(date));
    };

    const deletionTypeColors = {
      Farmer: "#4CAF50",
      Agent: "#66BB6A",
      Product: "#81C784",
    };

    const deletionTypeIcons = {
      Farmer: "👨‍🌾",
      Agent: "👤",
      Product: "📦",
    };

    const mailOptions = {
      from: process.env.COMPANY_EMAIL,
      to: adminEmails,
      subject: `🚨 Admin Deletion Alert - ${deletionType} Removed`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
          <div style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                🔔 Agrigate Admin Alert
              </h1>
              <p style="color: rgba(255,255,255,0.95); margin: 8px 0 0 0; font-size: 14px;">
                Administrative Deletion Notification System
              </p>
            </div>
            
            <!-- Alert Banner -->
            <div style="background: linear-gradient(90deg, ${
              deletionTypeColors[deletionType] || "#4CAF50"
            }, ${
        deletionTypeColors[deletionType] || "#45a049"
      }); padding: 20px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 8px;">${
                deletionTypeIcons[deletionType] || "🗑️"
              }</div>
              <h2 style="color: white; margin: 0; font-size: 22px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                ${deletionType} Deletion Recorded
              </h2>
            </div>
            
            <!-- Content -->
            <div style="padding: 35px 30px;">
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                This is an automated notification to inform the administrator that a <strong style="color: #2d3748;">${deletionType.toLowerCase()}</strong> 
                has been permanently deleted from the Agrigate system.
              </p>
              
              <!-- Deletion Details Card -->
              <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-left: 5px solid ${
                deletionTypeColors[deletionType] || "#4CAF50"
              }; border-radius: 8px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #2d3748; margin: 0 0 18px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                  // <span style="background: ${
                    deletionTypeColors[deletionType] || "#4CAF50"
                  }; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 16px;">📋</span>
                  Deletion Details
                </h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; color: #64748b; font-weight: 600; width: 35%; vertical-align: top;">Deleted Item:</td>
                    <td style="padding: 12px 0; color: #1e293b; font-weight: 500;">
                      <span style="background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 6px; font-family: 'Courier New', monospace;">
                        ${deletedItemName}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #64748b; font-weight: 600; border-top: 1px solid #e2e8f0; vertical-align: top;">Item Type:</td>
                    <td style="padding: 12px 0; color: #1e293b; border-top: 1px solid #e2e8f0;">
                      <span style="background: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 6px; font-weight: 500;">
                        ${deletionType}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #64748b; font-weight: 600; border-top: 1px solid #e2e8f0; vertical-align: top;">Database ID:</td>
                    <td style="padding: 12px 0; color: #475569; border-top: 1px solid #e2e8f0; font-family: 'Courier New', monospace; font-size: 13px; word-break: break-all;">
                      ${deletedItemId}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #64748b; font-weight: 600; border-top: 1px solid #e2e8f0; vertical-align: top;">Deleted By:</td>
                    <td style="padding: 12px 0; color: #1e293b; border-top: 1px solid #e2e8f0;">
                      <strong>${
                        adminName || adminEmail || "Unknown Admin"
                      }</strong><br>
                      <span style="color: #64748b; font-size: 14px;">${
                        adminEmail || "Email not available"
                      }</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #64748b; font-weight: 600; border-top: 1px solid #e2e8f0; vertical-align: top;">Date & Time:</td>
                    <td style="padding: 12px 0; color: #1e293b; border-top: 1px solid #e2e8f0; line-height: 1.5;">
                      ${formatTimestamp(timestamp)}
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Security Notice -->
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 8px; padding: 18px; margin: 25px 0;">
                <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                  <span style="font-size: 20px; margin-right: 8px;">⚠️</span>
                  <strong>Important:</strong> This action is permanent and cannot be undone. All associated data has been removed from the database. 
                  Please ensure this deletion was authorized and documented according to company policy.
                </p>
              </div>
              
              <!-- Action Recommendation -->
              <div style="background: #f1f8f4; border-left: 4px solid #4CAF50; border-radius: 6px; padding: 16px; margin: 20px 0;">
                <p style="color: #2d5f3a; margin: 0; font-size: 14px; line-height: 1.6;">
                  <strong>💡 Recommended Actions:</strong><br>
                  • Verify this deletion was authorized<br>
                  • Update any related documentation<br>
                  • Check for dependent records that may need attention<br>
                  • Review audit logs if necessary
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 13px; margin: 0 0 10px 0; line-height: 1.5;">
                This is an automated notification sent to the administrator. This email was generated by the Agrigate Admin Monitoring System.
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                If you did not perform this action or believe this notification was sent in error, please contact your system administrator immediately.
              </p>
            </div>
            
            <!-- Bottom Branding -->
            <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 20px; text-align: center;">
              <p style="color: #e2e8f0; margin: 0; font-size: 13px; font-weight: 500;">
                © ${new Date().getFullYear()} Agrigate Company Limited
              </p>
              <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 12px;">
                Agricultural Technology Solutions • Admin Dashboard
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
        AGRIGATE ADMIN DELETION ALERT
        ========================================
        
        ${deletionType} Deletion Recorded
        
        DELETION DETAILS:
        ─────────────────────────────────────
        Deleted Item: ${deletedItemName}
        Item Type: ${deletionType}
        Database ID: ${deletedItemId}
        Deleted By: ${adminName || "Unknown Admin"}
        Admin Email: ${adminEmail}
        Date & Time: ${formatTimestamp(timestamp)}
        
        ⚠️ IMPORTANT: This action is permanent and cannot be undone.
        
        RECOMMENDED ACTIONS:
        • Verify this deletion was authorized
        • Update any related documentation
        • Check for dependent records
        • Review audit logs if necessary
        
        ─────────────────────────────────────
        This is an automated notification sent to all administrators.
        
        © ${new Date().getFullYear()} Agrigate Company Limited
        Agricultural Technology Solutions
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(
        `✅ Deletion notification sent to ${adminEmails.length} admin(s):`,
        info.response
      );
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Error sending deletion notification email:", error);
      // Don't throw error to prevent deletion from failing if email fails
      return { success: false, error: error.message };
    }
  }

  // Send Scratch Card Creation Notification Email
  async sendScratchCardCreationEmail(adminEmails, cardData) {
    const { creatorEmail, creatorName, cardCount, cardValue, timestamp } =
      cardData;

    const formatTimestamp = (date) => {
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "full",
        timeStyle: "long",
        timeZone: "Africa/Kampala", // Uganda timezone (EAT - East Africa Time)
      }).format(new Date(date));
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("en-UG", {
        style: "currency",
        currency: "UGX",
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const totalValue = cardCount * cardValue;

    const mailOptions = {
      from: process.env.COMPANY_EMAIL,
      to: adminEmails,
      subject: `💳 Scratch Cards Generated - ${cardCount} Cards Created`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
          <div style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                💳 Agrigate Admin Alert
              </h1>
              <p style="color: rgba(255,255,255,0.95); margin: 8px 0 0 0; font-size: 14px;">
                Scratch Card Generation Notification System
              </p>
            </div>
            
            <!-- Alert Banner -->
            <div style="background: linear-gradient(90deg, #10b981, #059669); padding: 20px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 8px;">🎟️</div>
              <h2 style="color: white; margin: 0; font-size: 22px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                Scratch Cards Generated Successfully
              </h2>
            </div>
            
            <!-- Content -->
            <div style="padding: 35px 30px;">
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                This is an automated notification to inform the administrator that new <strong style="color: #2d3748;">scratch cards</strong> 
                have been generated in the Agrigate system.
              </p>
              
              <!-- Card Generation Details -->
              <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-left: 5px solid #10b981; border-radius: 8px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #2d3748; margin: 0 0 18px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                  // <span style="background: #10b981; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 16px;">📋</span>
                  Generation Details
                </h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; color: #64748b; font-weight: 600; width: 35%; vertical-align: top;">Cards Generated:</td>
                    <td style="padding: 12px 0; color: #1e293b; font-weight: 500;">
                      <span style="background: #d1fae5; color: #065f46; padding: 6px 14px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 18px; font-weight: 700;">
                        ${cardCount} Cards
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #64748b; font-weight: 600; border-top: 1px solid #e2e8f0; vertical-align: top;">Card Value:</td>
                    <td style="padding: 12px 0; color: #1e293b; border-top: 1px solid #e2e8f0;">
                      <span style="background: #fef3c7; color: #92400e; padding: 6px 14px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                        ${formatCurrency(cardValue)} Each
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #64748b; font-weight: 600; border-top: 1px solid #e2e8f0; vertical-align: top;">Total Value:</td>
                    <td style="padding: 12px 0; color: #1e293b; border-top: 1px solid #e2e8f0;">
                      <span style="background: #dbeafe; color: #1e40af; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 16px;">
                        ${formatCurrency(totalValue)}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #64748b; font-weight: 600; border-top: 1px solid #e2e8f0; vertical-align: top;">Generated By:</td>
                    <td style="padding: 12px 0; color: #1e293b; border-top: 1px solid #e2e8f0;">
                      <strong>${
                        creatorName || creatorEmail || "Unknown Admin"
                      }</strong><br>
                      <span style="color: #64748b; font-size: 14px;">${
                        creatorEmail || "Email not available"
                      }</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #64748b; font-weight: 600; border-top: 1px solid #e2e8f0; vertical-align: top;">Date & Time:</td>
                    <td style="padding: 12px 0; color: #1e293b; border-top: 1px solid #e2e8f0; line-height: 1.5;">
                      ${formatTimestamp(timestamp)}
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Info Notice -->
              <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 2px solid #3b82f6; border-radius: 8px; padding: 18px; margin: 25px 0;">
                <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.6;">
                  <span style="font-size: 20px; margin-right: 8px;">ℹ️</span>
                  <strong>Note:</strong> These scratch cards are now available in the system with "unused" status. 
                  They can be distributed to farmers and redeemed through the USSD or mobile app.
                </p>
              </div>
              
              <!-- Action Recommendation -->
              <div style="background: #f1f8f4; border-left: 4px solid #4CAF50; border-radius: 6px; padding: 16px; margin: 20px 0;">
                <p style="color: #2d5f3a; margin: 0; font-size: 14px; line-height: 1.6;">
                  <strong>💡 Recommended Actions:</strong><br>
                  • Verify the card generation was authorized<br>
                  • Update scratch card inventory records<br>
                  • Ensure proper distribution protocols are followed<br>
                  • Monitor card usage and redemption rates
                </p>
              </div>
              
              <!-- Statistics Summary -->
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 16px; margin: 20px 0;">
                <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                  <strong>📊 Generation Summary:</strong><br>
                  • ${cardCount} new scratch cards created<br>
                  • Total worth: ${formatCurrency(totalValue)}<br>
                  • Status: Ready for distribution<br>
                  • Cards are now trackable in the system
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 13px; margin: 0 0 10px 0; line-height: 1.5;">
                This is an automated notification sent to the administrator. This email was generated by the Agrigate Scratch Card Monitoring System.
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                If you did not perform this action or believe this notification was sent in error, please contact your system administrator immediately.
              </p>
            </div>
            
            <!-- Bottom Branding -->
            <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 20px; text-align: center;">
              <p style="color: #e2e8f0; margin: 0; font-size: 13px; font-weight: 500;">
                © ${new Date().getFullYear()} Agrigate Company Limited
              </p>
              <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 12px;">
                Agricultural Technology Solutions • Admin Dashboard
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
        AGRIGATE SCRATCH CARD GENERATION ALERT
        ========================================
        
        Scratch Cards Generated Successfully
        
        GENERATION DETAILS:
        ─────────────────────────────────────
        Cards Generated: ${cardCount} Cards
        Card Value: ${formatCurrency(cardValue)} Each
        Total Value: ${formatCurrency(totalValue)}
        Generated By: ${creatorName || "Unknown Admin"}
        Creator Email: ${creatorEmail}
        Date & Time: ${formatTimestamp(timestamp)}
        
        ℹ️ NOTE: These scratch cards are now available with "unused" status.
        
        RECOMMENDED ACTIONS:
        • Verify the card generation was authorized
        • Update scratch card inventory records
        • Ensure proper distribution protocols
        • Monitor card usage and redemption rates
        
        GENERATION SUMMARY:
        • ${cardCount} new scratch cards created
        • Total worth: ${formatCurrency(totalValue)}
        • Status: Ready for distribution
        
        ─────────────────────────────────────
        This is an automated notification sent to all administrators.
        
        © ${new Date().getFullYear()} Agrigate Company Limited
        Agricultural Technology Solutions
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(
        `✅ Scratch card creation notification sent to ${adminEmails.length} admin(s):`,
        info.response
      );
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(
        "❌ Error sending scratch card creation notification:",
        error
      );
      // Don't throw error to prevent card creation from failing if email fails
      return { success: false, error: error.message };
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
