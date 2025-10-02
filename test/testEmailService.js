require("dotenv").config();
const EmailService = require("../services/emailService");

async function testEmailService() {
  console.log("🧪 Testing Agrigate Email Service...\n");

  try {
    // Test 1: Connection Test
    console.log("1️⃣ Testing email service connection...");
    await EmailService.testConnection();
    console.log("✅ Email service connection successful!\n");

    // Test 2: OTP Email
    console.log("2️⃣ Testing OTP email...");
    await EmailService.sendOTPEmail(
      "Test Agent",
      "test@example.com", // Change this to your test email
      "123456"
    );
    console.log("✅ OTP email sent successfully!\n");

    // Test 3: Password Reset Email
    console.log("3️⃣ Testing password reset email...");
    await EmailService.sendPasswordResetEmail(
      "Test Agent",
      "test@example.com", // Change this to your test email
      "newPassword123"
    );
    console.log("✅ Password reset email sent successfully!\n");

    // Test 4: Agent Registration Email
    console.log("4️⃣ Testing agent registration email...");
    await EmailService.sendAgentRegistrationEmail(
      "Test Agent",
      "test@example.com", // Change this to your test email
      "initialPassword123"
    );
    console.log("✅ Agent registration email sent successfully!\n");

    console.log("🎉 All email tests completed successfully!");
    console.log("\n📧 Email Configuration Summary:");
    console.log(`📮 SMTP Service: Gmail`);
    console.log(`📬 From Address: ${process.env.COMPANY_EMAIL}`);
    console.log(`🔐 Authentication: App Password (configured)`);
    console.log(`🚀 Status: Ready for production`);
  } catch (error) {
    console.error("❌ Email test failed:", error.message);
    console.error("\n🔧 Troubleshooting:");
    console.error(
      "• Check your .env file has COMPANY_EMAIL and COMPANY_PASSWORD"
    );
    console.error("• Verify Gmail App Password is correct");
    console.error("• Ensure 2FA is enabled on Gmail account");
    console.error("• Check internet connection");
  }
}

// Run the test
testEmailService();
