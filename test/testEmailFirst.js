require("dotenv").config();
const EmailService = require("../services/emailService");
const axios = require("axios");

const TEST_CONFIG = {
  API_URL: "http://localhost:7748/admin", // Adjust port if different

  // Test user credentials (update to match real user)
  TEST_USER: {
    email: "test@agrigate.com", // Must exist in database
    password: "testPassword123", // Must be correct
  },
};

console.log("🎯 Email-First OTP Configuration Test");
console.log("=====================================");
console.log(`📧 Primary Method: Email (always enabled)`);
console.log(
  `📱 SMS Method: ${
    process.env.SMS_OTP_ENABLED === "true" ? "ENABLED" : "DISABLED"
  }`
);
console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
console.log(`🔗 API URL: ${TEST_CONFIG.API_URL}`);
console.log("=====================================\n");

async function testEmailFirstConfiguration() {
  try {
    // Test 1: Email Service Connection
    console.log("1️⃣ Testing Email Service Connection...");
    await EmailService.testConnection();
    console.log("✅ Email service connected successfully!\n");

    // Test 2: Default Email OTP (no method specified)
    console.log("2️⃣ Testing Default Login (should use email by default)...");
    try {
      const defaultResponse = await axios.post(`${TEST_CONFIG.API_URL}/login`, {
        email: TEST_CONFIG.TEST_USER.email,
        password: TEST_CONFIG.TEST_USER.password,
        // No otpMethod specified - should default to email
      });

      console.log("✅ Default login successful!");
      console.log(`📧 Message: ${defaultResponse.data.message}`);
      console.log(
        `📮 Method Used: ${defaultResponse.data.otpMethod || "email (default)"}`
      );

      if (defaultResponse.data.userId) {
        console.log(`👤 User ID: ${defaultResponse.data.userId}\n`);
      }
    } catch (apiError) {
      console.log(
        `⚠️ Default login: ${
          apiError.response?.data?.message || apiError.message
        }\n`
      );
    }

    // Test 3: Explicit Email OTP Request
    console.log("3️⃣ Testing Explicit Email OTP Request...");
    try {
      const emailResponse = await axios.post(`${TEST_CONFIG.API_URL}/login`, {
        email: TEST_CONFIG.TEST_USER.email,
        password: TEST_CONFIG.TEST_USER.password,
        otpMethod: "email",
      });

      console.log("✅ Email OTP request successful!");
      console.log(`📧 Message: ${emailResponse.data.message}`);
      console.log(`📮 Method Used: ${emailResponse.data.otpMethod}`);

      if (emailResponse.data.userId) {
        console.log(`👤 User ID: ${emailResponse.data.userId}\n`);

        // Test 4: Email Resend
        console.log("4️⃣ Testing Email OTP Resend...");
        const resendEmailResponse = await axios.post(
          `${TEST_CONFIG.API_URL}/resend-otp`,
          {
            userId: emailResponse.data.userId,
            otpMethod: "email",
          }
        );

        console.log("✅ Email resend successful!");
        console.log(`📧 Message: ${resendEmailResponse.data.message}\n`);
      }
    } catch (apiError) {
      console.log(
        `⚠️ Email OTP: ${
          apiError.response?.data?.message || apiError.message
        }\n`
      );
    }

    // Test 5: SMS OTP Request (behavior depends on SMS_OTP_ENABLED)
    console.log("5️⃣ Testing SMS OTP Request...");
    const smsEnabled = process.env.SMS_OTP_ENABLED === "true";

    try {
      const smsResponse = await axios.post(`${TEST_CONFIG.API_URL}/login`, {
        email: TEST_CONFIG.TEST_USER.email,
        password: TEST_CONFIG.TEST_USER.password,
        otpMethod: "sms",
      });

      console.log("✅ SMS OTP request processed!");
      console.log(`📱 Message: ${smsResponse.data.message}`);
      console.log(`📮 Actual Method: ${smsResponse.data.otpMethod}`);

      if (smsEnabled) {
        console.log("💡 SMS was enabled - request honored");
      } else {
        console.log("💡 SMS was disabled - redirected to email");
      }
    } catch (smsError) {
      console.log(
        `📱 SMS Response: ${
          smsError.response?.data?.message || smsError.message
        }`
      );
      if (smsError.response?.data?.availableMethods) {
        console.log(
          `🔄 Available Methods: ${smsError.response.data.availableMethods.join(
            ", "
          )}`
        );
      }
    }

    console.log("\n🎉 Email-First Configuration Test Complete!");
    console.log("\n📊 Summary:");
    console.log(`📧 Email OTP: ✅ Primary method (always available)`);
    console.log(
      `📱 SMS OTP: ${
        smsEnabled ? "✅ Available as backup" : "🚫 Disabled (cost control)"
      }`
    );
    console.log(
      `💰 SMS Costs: ${
        smsEnabled ? "⚠️ Apply when SMS is used" : "✅ Zero (SMS disabled)"
      }`
    );
    console.log(
      `🚀 Recommendation: ${
        smsEnabled
          ? "Consider disabling SMS to save costs"
          : "Perfect - email-only saves money"
      }`
    );

    if (!smsEnabled) {
      console.log(
        "\n💡 To enable SMS backup: node scripts/configureSMS.js enable"
      );
    } else {
      console.log(
        "\n💡 To disable SMS (save costs): node scripts/configureSMS.js disable"
      );
    }
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error("\n🔧 Troubleshooting:");
    console.error("1. Ensure backend server is running: nodemon server -c");
    console.error("2. Update TEST_USER credentials in this script");
    console.error("3. Check email configuration in .env file");
    console.error("4. Verify database connection");
  }
}

// Check configuration first
const smsEnabled = process.env.SMS_OTP_ENABLED === "true";
console.log(
  `🎯 Current Mode: ${
    smsEnabled ? "Email + SMS Backup" : "Email-Only (Recommended)"
  }`
);

if (TEST_CONFIG.TEST_USER.email === "test@agrigate.com") {
  console.log("\n⚠️  CONFIGURATION REQUIRED");
  console.log(
    "Please update TEST_USER credentials in this script before running tests!"
  );
  console.log(
    "The user must exist in your database with correct credentials.\n"
  );
  process.exit(1);
}

// Run the test
testEmailFirstConfiguration();
