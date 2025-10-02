require("dotenv").config();
const EmailService = require("../services/emailService");
const axios = require("axios");

// Configuration for testing
const TEST_CONFIG = {
  // Change this to your test email address
  TEST_EMAIL: "your-test-email@gmail.com", // ⚠️ CHANGE THIS TO YOUR EMAIL

  // Test user credentials (for login testing)
  TEST_USER: {
    email: "test@agrigate.com", // Must exist in your database
    password: "testPassword123", // Must be correct password
  },

  // API Base URL
  API_URL: "http://localhost:7748/admin", // Adjust port if different
};

console.log("🧪 Agrigate Email OTP Testing Suite\n");
console.log("=".repeat(60));
console.log("📧 Email Test Configuration:");
console.log(`• Test Email: ${TEST_CONFIG.TEST_EMAIL}`);
console.log(`• API URL: ${TEST_CONFIG.API_URL}`);
console.log(`• NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`• EMAIL_TEST_MODE: ${process.env.EMAIL_TEST_MODE}`);
console.log("=".repeat(60) + "\n");

async function testEmailOTPWorkflow() {
  try {
    // Test 1: Email Service Direct Test
    console.log("1️⃣ Testing Email Service Direct Connection...");
    await EmailService.testConnection();
    console.log("✅ Email service connection successful!\n");

    // Test 2: Send OTP Email Directly
    console.log("2️⃣ Testing Direct OTP Email Send...");
    await EmailService.sendOTPEmail(
      "Test User",
      TEST_CONFIG.TEST_EMAIL,
      "123456"
    );
    console.log("✅ Direct OTP email sent successfully!\n");

    // Test 3: Test Login with Email OTP
    console.log("3️⃣ Testing Login API with Email OTP...");
    try {
      const loginResponse = await axios.post(`${TEST_CONFIG.API_URL}/login`, {
        email: TEST_CONFIG.TEST_USER.email,
        password: TEST_CONFIG.TEST_USER.password,
        otpMethod: "email",
      });

      console.log("✅ Login API successful!");
      console.log(`📧 Response: ${loginResponse.data.message}`);

      if (loginResponse.data.userId) {
        console.log(`👤 User ID: ${loginResponse.data.userId}`);

        // Test 4: Test Resend OTP with Email
        console.log("\n4️⃣ Testing Resend OTP API with Email...");
        const resendResponse = await axios.post(
          `${TEST_CONFIG.API_URL}/resend-otp`,
          {
            userId: loginResponse.data.userId,
            otpMethod: "email",
          }
        );

        console.log("✅ Resend OTP API successful!");
        console.log(`📧 Response: ${resendResponse.data.message}`);
      }
    } catch (apiError) {
      if (apiError.response) {
        console.log(`⚠️ API Response: ${apiError.response.data.message}`);
        if (
          apiError.response.status === 400 &&
          apiError.response.data.message === "Invalid Credentials"
        ) {
          console.log(
            "💡 Note: Update TEST_USER credentials in the script to match a real user in your database"
          );
        }
      } else {
        console.log(`⚠️ API Error: ${apiError.message}`);
        console.log(
          "💡 Note: Make sure your backend server is running on the correct port"
        );
      }
    }

    console.log("\n🎉 Email OTP Testing Completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("\n🔧 Troubleshooting Steps:");
    console.error("1. Verify your .env file has correct email credentials");
    console.error("2. Check that EMAIL_TEST_MODE=true in your .env file");
    console.error("3. Update TEST_EMAIL in this script to your real email");
    console.error("4. Ensure backend server is running");
    console.error("5. Update TEST_USER credentials to match a real user");
  }
}

// Helper function to setup email test mode
function setupEmailTestMode() {
  console.log("⚙️ Email Test Mode Setup Instructions:");
  console.log("\n📝 To test email OTP in production mode:");
  console.log("1. Set EMAIL_TEST_MODE=true in your .env file");
  console.log("2. Set NODE_ENV=production (optional)");
  console.log("3. Update TEST_EMAIL in this script");
  console.log("4. Run: node test/testEmailOTP.js");
  console.log("\n🔄 This will:");
  console.log("• Enable email OTP delivery");
  console.log("• Disable SMS sending (no SMS costs)");
  console.log("• Log SMS attempts to console only");
  console.log("• Test complete email workflow");
}

// Check if properly configured
if (TEST_CONFIG.TEST_EMAIL === "your-test-email@gmail.com") {
  console.log("⚠️  CONFIGURATION REQUIRED");
  setupEmailTestMode();
  console.log(
    "\n🚨 Please update TEST_EMAIL in this script before running tests!\n"
  );
  process.exit(1);
}

// Run tests
testEmailOTPWorkflow();
