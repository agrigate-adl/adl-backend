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
    const smsEnabled = envContent.match(/SMS_OTP_ENABLED=(.+)/)?.[1] || "false";
    const emailTestMode =
      envContent.match(/EMAIL_TEST_MODE=(.+)/)?.[1] || "false";

    console.log("\n📋 Current OTP Configuration:");
    console.log(`• NODE_ENV: ${nodeEnv}`);
    console.log(`• SMS_OTP_ENABLED: ${smsEnabled}`);
    console.log(`• EMAIL_TEST_MODE: ${emailTestMode} (deprecated)`);

    console.log("\n🎯 OTP Delivery Status:");
    console.log("📧 EMAIL OTP: ✅ ALWAYS ENABLED (Primary Method)");

    if (smsEnabled === "true") {
      console.log("📱 SMS OTP: ✅ ENABLED (Secondary/Backup Method)");
      console.log("💰 Cost Impact: SMS charges will apply when used");
    } else {
      console.log("📱 SMS OTP: 🚫 DISABLED (Cost Control Mode)");
      console.log("💰 Cost Impact: Zero SMS costs");
    }

    console.log("\n🔄 Fallback Logic:");
    if (smsEnabled === "true") {
      console.log("• Email fails → Try SMS backup");
      console.log("• SMS fails → Try Email backup");
    } else {
      console.log("• Email fails → No SMS backup (email retry only)");
      console.log("• SMS requested → Auto-redirect to Email");
    }
  } catch (error) {
    console.error("❌ Error reading .env file:", error.message);
  }
}

function showUsage() {
  console.log("📧 Agrigate Email-First OTP Configuration");
  console.log("========================================\n");
  console.log("🎯 Email OTP is ALWAYS the primary delivery method");
  console.log("📱 SMS OTP is optional and can be disabled for cost control\n");
  console.log("Usage:");
  console.log("  node scripts/configureSMS.js [command]");
  console.log("\nCommands:");
  console.log("  enable     - Enable SMS OTP as backup (costs apply)");
  console.log("  disable    - Disable SMS OTP completely (recommended)");
  console.log("  status     - Show current OTP configuration");
  console.log("\nExamples:");
  console.log(
    "  node scripts/configureSMS.js disable   # Email-only mode (no SMS costs)"
  );
  console.log(
    "  node scripts/configureSMS.js enable    # Email + SMS backup (SMS costs)"
  );
  console.log(
    "  node scripts/configureSMS.js status    # Check current settings"
  );
  console.log("\n💡 Recommendation: Keep SMS disabled to avoid costs");
  console.log("   Email delivery is faster and more reliable than SMS");
}

// Parse command line arguments
const command = process.argv[2];

switch (command) {
  case "enable":
    console.log("📱 Enabling SMS OTP as backup method...");
    updateEnvVariable("SMS_OTP_ENABLED", "true");
    console.log("\n✅ SMS OTP enabled as backup method");
    console.log("📧 PRIMARY: Email OTP (always available)");
    console.log("📱 SECONDARY: SMS OTP (backup/alternative)");
    console.log("\n⚠️  WARNING: SMS charges will apply when SMS is used");
    console.log("💡 Users can still choose email to avoid SMS costs");
    break;

  case "disable":
    console.log("🚫 Disabling SMS OTP (Email-only mode)...");
    updateEnvVariable("SMS_OTP_ENABLED", "false");
    console.log("\n✅ SMS OTP disabled - Email-only mode active");
    console.log("📧 Email OTP: ENABLED (primary method)");
    console.log("📱 SMS OTP: DISABLED");
    console.log("\n💰 Cost Benefits:");
    console.log("• Zero SMS charges");
    console.log("• Faster email delivery");
    console.log("• Professional HTML templates");
    console.log("• Better user experience");
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
  console.log("🔄 Command: nodemon server -c");
}
