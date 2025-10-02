#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");

function updateEnvVariable(key, value) {
  try {
    let envContent = fs.readFileSync(envPath, "utf8");

    // Check if the variable already exists
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(envContent)) {
      // Update existing variable
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      // Add new variable
      envContent += `\n${key}=${value}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Updated ${key}=${value} in .env file`);
  } catch (error) {
    console.error(`❌ Error updating .env file:`, error.message);
  }
}

function showCurrentConfig() {
  try {
    const envContent = fs.readFileSync(envPath, "utf8");
    const nodeEnv = envContent.match(/NODE_ENV=(.+)/)?.[1] || "not set";
    const emailTestMode =
      envContent.match(/EMAIL_TEST_MODE=(.+)/)?.[1] || "not set";

    console.log("\n📋 Current Configuration:");
    console.log(`• NODE_ENV: ${nodeEnv}`);
    console.log(`• EMAIL_TEST_MODE: ${emailTestMode}`);

    if (emailTestMode === "true") {
      console.log("\n🧪 EMAIL TEST MODE ACTIVE:");
      console.log("• Email OTP delivery: ✅ ENABLED");
      console.log("• SMS sending: 🚫 DISABLED");
      console.log("• Perfect for testing email functionality!");
    } else {
      console.log("\n🔧 Standard Mode:");
      if (nodeEnv === "development") {
        console.log("• Email OTP delivery: ✅ ENABLED");
        console.log("• SMS sending: 🚫 DISABLED (development mode)");
      } else {
        console.log("• Email OTP delivery: ✅ ENABLED");
        console.log("• SMS sending: ✅ ENABLED (production mode)");
      }
    }
  } catch (error) {
    console.error("❌ Error reading .env file:", error.message);
  }
}

function showUsage() {
  console.log("🔧 Agrigate Email Test Mode Configuration");
  console.log("========================================\n");
  console.log("Usage:");
  console.log("  node scripts/configureEmailTest.js [command]");
  console.log("\nCommands:");
  console.log("  enable     - Enable email test mode (disable SMS)");
  console.log("  disable    - Disable email test mode");
  console.log("  status     - Show current configuration");
  console.log("  dev        - Set to development mode");
  console.log("  prod       - Set to production mode");
  console.log("\nExamples:");
  console.log(
    "  node scripts/configureEmailTest.js enable   # Test email OTP only"
  );
  console.log(
    "  node scripts/configureEmailTest.js disable  # Normal operation"
  );
  console.log(
    "  node scripts/configureEmailTest.js status   # Check current settings"
  );
}

// Parse command line arguments
const command = process.argv[2];

switch (command) {
  case "enable":
    console.log("🧪 Enabling Email Test Mode...");
    updateEnvVariable("EMAIL_TEST_MODE", "true");
    console.log("\n✅ Email test mode enabled!");
    console.log("• Email OTP delivery: ENABLED");
    console.log("• SMS sending: DISABLED");
    console.log("\n🚀 Now you can test email OTP without SMS costs!");
    console.log("💡 Run: npm test:email-otp");
    break;

  case "disable":
    console.log("🔧 Disabling Email Test Mode...");
    updateEnvVariable("EMAIL_TEST_MODE", "false");
    console.log("\n✅ Email test mode disabled - back to normal operation");
    break;

  case "dev":
    console.log("🛠️ Setting Development Mode...");
    updateEnvVariable("NODE_ENV", "development");
    updateEnvVariable("EMAIL_TEST_MODE", "false");
    console.log("\n✅ Development mode active");
    console.log("• SMS sending: DISABLED");
    console.log("• OTP will be logged to console");
    break;

  case "prod":
    console.log("🚀 Setting Production Mode...");
    updateEnvVariable("NODE_ENV", "production");
    updateEnvVariable("EMAIL_TEST_MODE", "false");
    console.log("\n✅ Production mode active");
    console.log("• SMS sending: ENABLED");
    console.log("• Full OTP functionality active");
    break;

  case "status":
    showCurrentConfig();
    break;

  default:
    showUsage();
    break;
}

if (command && command !== "status") {
  console.log("\n" + "=".repeat(50));
  showCurrentConfig();
  console.log("\n💡 Tip: Restart your server to apply changes");
}
