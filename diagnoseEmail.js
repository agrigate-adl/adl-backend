require("dotenv").config();
const EmailService = require("./services/emailService");

console.log("🔍 Email Diagnostic Test");
console.log("========================");
console.log("📧 Email:", process.env.COMPANY_EMAIL);
console.log("🔑 Password set:", !!process.env.COMPANY_PASSWORD);
console.log("📝 Password length:", process.env.COMPANY_PASSWORD?.length || 0);
console.log("🧪 EMAIL_TEST_MODE:", process.env.EMAIL_TEST_MODE);
console.log("🌍 NODE_ENV:", process.env.NODE_ENV);

async function testEmailConnection() {
  try {
    console.log("\n🔌 Testing SMTP connection...");
    const result = await EmailService.testConnection();
    console.log("✅ Connection successful!");

    console.log("\n📤 Testing email send to real address...");
    // Use your actual email for testing
    await EmailService.sendOTPEmail(
      "Test User",
      "agrigatecompanyug@gmail.com",
      "123456"
    );
    console.log("✅ Email send attempt completed!");
    console.log("📬 Check your inbox: agrigatecompanyug@gmail.com");
  } catch (error) {
    console.log("\n❌ Error:", error.message);

    if (error.code === "EAUTH") {
      console.log("\n🚨 AUTHENTICATION ERROR - Invalid credentials");
      console.log("💡 Solutions:");
      console.log("1. Check Gmail App Password is correct");
      console.log("2. Verify 2FA is enabled on Gmail account");
      console.log("3. Generate new App Password from Google Account");
      console.log("4. Ensure no spaces in password");
    } else if (error.code === "ENOTFOUND") {
      console.log("\n🚨 NETWORK ERROR - Cannot reach Gmail servers");
      console.log("💡 Check your internet connection");
    } else if (error.code === "ETIMEDOUT") {
      console.log("\n🚨 TIMEOUT ERROR - Connection timed out");
      console.log("💡 Check firewall/network settings");
    } else {
      console.log("\n🔧 Full error details:");
      console.log("Code:", error.code);
      console.log("Command:", error.command);
      console.log("Response:", error.response);
      console.log("ResponseCode:", error.responseCode);
    }
  }
}

testEmailConnection();
