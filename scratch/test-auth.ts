import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import { prisma } from "../src/lib/db/prisma";

async function runTests() {
  console.log("🚀 Starting Authentication and Hashing Tests...\n");

  // Test 1: Hashing and Verification
  console.log("🧪 Test 1: Hashing and Verification");
  const testPassword = "MySecurePassword123!";
  const hash = await hashPassword(testPassword);
  console.log(`- Password hashed: ${hash.substring(0, 40)}...`);

  const isValid = await verifyPassword(testPassword, hash);
  console.log(`- Verification with correct password: ${isValid ? "✅ PASS" : "❌ FAIL"}`);

  const isInvalid = await verifyPassword("WrongPassword123!", hash);
  console.log(`- Verification with incorrect password: ${!isInvalid ? "✅ PASS" : "❌ FAIL"}`);

  if (!isValid || isInvalid) {
    throw new Error("Password verification test failed");
  }

  // Test 2: Database Connection
  console.log("\n🧪 Test 2: Database Connection");
  try {
    const userCount = await prisma.user.count();
    console.log(`- Successfully queried database. User count: ${userCount} ✅ PASS`);
  } catch (err: any) {
    console.error(`- Database connection failed: ${err.message} ❌ FAIL`);
    throw err;
  }

  console.log("\n🎉 All tests passed successfully!");
}

runTests().catch((err) => {
  console.error("❌ Tests failed:", err);
  process.exit(1);
});
