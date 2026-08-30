import { DiskStorageProvider } from "../src/lib/storage/provider";
import crypto from "crypto";

// Mock signature check helper
function validateFileSignature(buffer: Buffer): string | null {
  if (buffer.length < 4) return null;

  const hex = buffer.toString("hex", 0, 8).toUpperCase();

  if (hex.startsWith("25504446")) return "application/pdf";
  if (hex.startsWith("89504E47")) return "image/png";
  if (hex.startsWith("FFD8FF")) return "image/jpeg";
  if (hex.startsWith("52494646") && buffer.toString("hex", 8, 12).toUpperCase() === "57454250") {
    return "image/webp";
  }

  return null;
}

async function runUploadTests() {
  console.log("🧪 Starting Secure Prescription Upload Pipeline Tests...\n");

  const storage = new DiskStorageProvider();

  // Test 1: Valid PDF Signature Match
  console.log("🧪 Test 1: Valid PDF Signature Match");
  const pdfBuffer = Buffer.from("%PDF-1.4 file content goes here...");
  const validatedMimePdf = validateFileSignature(pdfBuffer);
  console.log(`- PDF buffer checked. MIME: ${validatedMimePdf}`);
  if (validatedMimePdf !== "application/pdf") {
    throw new Error("PDF signature validation failed");
  }
  console.log("✅ PASS");

  // Test 2: Valid JPEG Signature Match
  console.log("\n🧪 Test 2: Valid JPEG Signature Match");
  const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  const validatedMimeJpeg = validateFileSignature(jpegBuffer);
  console.log(`- JPEG buffer checked. MIME: ${validatedMimeJpeg}`);
  if (validatedMimeJpeg !== "image/jpeg") {
    throw new Error("JPEG signature validation failed");
  }
  console.log("✅ PASS");

  // Test 3: Invalid File Signature Rejection
  console.log("\n🧪 Test 3: Invalid File Signature Rejection");
  const exeBuffer = Buffer.from("MZ\x90\x00\x03\x00\x00\x00... executable file headers");
  const validatedMimeExe = validateFileSignature(exeBuffer);
  console.log(`- Exe buffer checked. MIME: ${validatedMimeExe}`);
  if (validatedMimeExe !== null) {
    throw new Error("Executable signature was incorrectly accepted!");
  }
  console.log("✅ PASS");

  // Test 4: Local Storage File Write & Retrieval
  console.log("\n🧪 Test 4: Local Storage File Write & Retrieval");
  const testKey = `test-${crypto.randomUUID()}.png`;
  const testData = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]); // PNG header
  
  await storage.uploadFile(testData, testKey, "image/png");
  console.log(`- File uploaded successfully with key: ${testKey}`);

  const readData = await storage.getFileBuffer(testKey);
  if (readData.toString("hex") !== testData.toString("hex")) {
    throw new Error("Read buffer does not match written buffer!");
  }
  console.log("- Buffer read match verified. ✅ PASS");

  // Cleanup
  await storage.deleteFile(testKey);
  console.log("- Test file deleted. ✅ PASS");

  console.log("\n🎉 All Upload Pipeline logic tests passed successfully!");
}

runUploadTests().catch((err) => {
  console.error("❌ Tests failed:", err);
  process.exit(1);
});
