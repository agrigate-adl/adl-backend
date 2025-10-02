require("dotenv").config();
const axios = require("axios");

const TEST_CONFIG = {
  API_URL: "http://localhost:7748/admin", // Adjust port if different

  // Test admin credentials (update these to match a real admin user)
  TEST_ADMIN: {
    email: "admin@agrigate.com", // Must exist in your database with role: "admin"
    password: "adminPassword123", // Must be correct password
  },
};

console.log("🎯 Admin Dashboard Email OTP Test");
console.log("=================================");
console.log(`📧 Testing with: ${TEST_CONFIG.TEST_ADMIN.email}`);
console.log(`🔗 API URL: ${TEST_CONFIG.API_URL}`);
console.log(`📊 EMAIL_TEST_MODE: ${process.env.EMAIL_TEST_MODE}`);
console.log("=================================\n");

async function testAdminEmailOTP() {
  try {
    // Test 1: Login with Email OTP
    console.log("1️⃣ Testing Admin Login with Email OTP...");

    const loginResponse = await axios.post(`${TEST_CONFIG.API_URL}/login`, {
      email: TEST_CONFIG.TEST_ADMIN.email,
      password: TEST_CONFIG.TEST_ADMIN.password,
      otpMethod: "email", // Request email OTP
    });

    console.log("✅ Login request successful!");
    console.log(`📧 Response: ${loginResponse.data.message}`);
    console.log(`👤 User ID: ${loginResponse.data.userId}`);
    console.log(`📮 OTP Method: ${loginResponse.data.otpMethod || "email"}`);

    if (loginResponse.data.userId) {
      // Test 2: Resend OTP with Email
      console.log("\n2️⃣ Testing Resend OTP with Email...");

      const resendResponse = await axios.post(
        `${TEST_CONFIG.API_URL}/resend-otp`,
        {
          userId: loginResponse.data.userId,
          otpMethod: "email",
        }
      );

      console.log("✅ Resend OTP successful!");
      console.log(`📧 Response: ${resendResponse.data.message}`);
      console.log(`📮 Method: ${resendResponse.data.otpMethod || "email"}`);

      // Test 3: Try SMS Resend (should work in test mode)
      console.log(
        "\n3️⃣ Testing Resend OTP with SMS (should be logged only)..."
      );

      const resendSmsResponse = await axios.post(
        `${TEST_CONFIG.API_URL}/resend-otp`,
        {
          userId: loginResponse.data.userId,
          otpMethod: "sms",
        }
      );

      console.log("✅ SMS Resend request successful!");
      console.log(`📱 Response: ${resendSmsResponse.data.message}`);

      console.log("\n🎉 Admin Dashboard Email OTP Tests Completed!");
      console.log("\n📋 Next Steps:");
      console.log("1. Check your email inbox for OTP messages");
      console.log("2. Open admin dashboard and test the UI");
      console.log("3. Try both SMS and Email options in the dialog");
      console.log("4. Verify OTP with the received code");
    } else {
      console.log("⚠️  No user ID returned - check your admin credentials");
    }
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);

    if (error.response) {
      console.log(`📄 Status: ${error.response.status}`);
      console.log(
        `📝 Message: ${error.response.data?.message || "Unknown error"}`
      );

      if (
        error.response.status === 400 &&
        error.response.data?.message === "Invalid Credentials"
      ) {
        console.log("\n💡 Fix Required:");
        console.log(
          "Update TEST_ADMIN credentials in this script to match a real admin user in your database"
        );
        console.log('The user must have role: "admin" in MongoDB');
      }
    } else {
      console.log(
        "💡 Make sure your backend server is running on the correct port"
      );
    }

    console.log("\n🔧 Troubleshooting:");
    console.log("1. Verify backend server is running: nodemon server -c");
    console.log("2. Check EMAIL_TEST_MODE=true in .env file");
    console.log("3. Update TEST_ADMIN credentials above");
    console.log("4. Ensure admin user exists with correct role");
  }
}

// Check configuration
if (process.env.EMAIL_TEST_MODE !== "true") {
  console.log("⚠️  EMAIL_TEST_MODE is not enabled");
  console.log("💡 Run: npm run email:enable");
  console.log("💡 Or set EMAIL_TEST_MODE=true in your .env file\n");
}

// Run the test
testAdminEmailOTP();
