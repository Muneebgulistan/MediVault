import { generateSchedule, parseDuration } from "../src/lib/scheduling/engine";

function toLocalYMD(date: Date | null): string | null {
  if (!date) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function assertEqual(actual: any, expected: any, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    console.error(`❌ Assertion Failed: ${message}`);
    console.error(`   Expected:`, expected);
    console.error(`   Actual:  `, actual);
    throw new Error(`Assertion failed: ${message}`);
  }
}

function runTests() {
  console.log("🧪 Starting Medicine Scheduling Engine Unit Tests...\n");

  // Test 1: Once Daily
  console.log("🧪 Test 1: Once Daily");
  const res1 = generateSchedule({
    dosage: "1 tablet",
    frequency: "once daily",
    instructions: "take with water",
    startDateStr: "2026-08-30",
  });
  assertEqual(res1.success, true, "Should succeed");
  assertEqual(res1.needsClarification, false, "Should not need clarification");
  assertEqual(res1.isAsNeeded, false, "Should not be as needed");
  assertEqual(res1.occurrences.length, 1, "Should have 1 occurrence");
  assertEqual(res1.occurrences[0].scheduledTime, "08:00", "Should default to 08:00");
  assertEqual(res1.occurrences[0].dosage, "1 tablet", "Should match dosage");
  console.log("✅ PASS");

  // Test 2: Once Daily with Night/Sleep Instruction
  console.log("\n🧪 Test 2: Once Daily (Night instruction)");
  const res2 = generateSchedule({
    dosage: "1 capsule",
    frequency: "once daily",
    instructions: "before sleep",
    startDateStr: "2026-08-30",
  });
  assertEqual(res2.occurrences.length, 1, "Should have 1 occurrence");
  assertEqual(res2.occurrences[0].scheduledTime, "21:00", "Should adjust to bedtime (21:00)");
  console.log("✅ PASS");

  // Test 3: Twice Daily
  console.log("\n🧪 Test 3: Twice Daily");
  const res3 = generateSchedule({
    dosage: "2 tablets",
    frequency: "twice daily",
    startDateStr: "2026-08-30",
  });
  assertEqual(res3.occurrences.length, 2, "Should have 2 occurrences");
  assertEqual(res3.occurrences[0].scheduledTime, "08:00", "First dose at 08:00");
  assertEqual(res3.occurrences[1].scheduledTime, "20:00", "Second dose at 20:00");
  console.log("✅ PASS");

  // Test 4: Three Times Daily
  console.log("\n🧪 Test 4: Three Times Daily");
  const res4 = generateSchedule({
    dosage: "1 ml",
    frequency: "three times daily",
    startDateStr: "2026-08-30",
  });
  assertEqual(res4.occurrences.length, 3, "Should have 3 occurrences");
  assertEqual(res4.occurrences.map(o => o.scheduledTime), ["08:00", "14:00", "20:00"], "Should have tid intervals");
  console.log("✅ PASS");

  // Test 5: Every 8 Hours (interval calculation)
  console.log("\n🧪 Test 5: Every 8 Hours");
  const res5 = generateSchedule({
    dosage: "1 capsule",
    frequency: "every 8 hours",
    startDateStr: "2026-08-30",
  });
  assertEqual(res5.occurrences.length, 3, "Should have 3 occurrences (24 / 8 = 3)");
  assertEqual(res5.occurrences.map(o => o.scheduledTime), ["00:00", "08:00", "16:00"], "Should calculate 8-hour offsets from 08:00");
  console.log("✅ PASS");

  // Test 6: Duration Parsing (Days)
  console.log("\n🧪 Test 6: Duration Parsing (5 days)");
  const res6 = generateSchedule({
    dosage: "1 tablet",
    frequency: "once daily",
    duration: "for 5 days",
    startDateStr: "2026-08-30",
  });
  const expectedEndDate = new Date(res6.startDate);
  expectedEndDate.setDate(expectedEndDate.getDate() + 4); // Ends on Sep 3
  assertEqual(toLocalYMD(res6.endDate), toLocalYMD(expectedEndDate), "End date should represent last day of duration");
  console.log("✅ PASS");

  // Test 7: As needed (PRN) Exception
  console.log("\n🧪 Test 7: As needed (PRN) exception");
  const res7 = generateSchedule({
    dosage: "1 tablet",
    frequency: "as needed for headache",
    startDateStr: "2026-08-30",
  });
  assertEqual(res7.isAsNeeded, true, "Should identify as PRN");
  assertEqual(res7.occurrences.length, 0, "PRN should not generate recurring times slots");
  console.log("✅ PASS");

  // Test 8: Ambiguous/Clarification Guard
  console.log("\n🧪 Test 8: Ambiguous instruction clarification trigger");
  const res8 = generateSchedule({
    dosage: "1 tablet",
    frequency: "when you feel like it",
    startDateStr: "2026-08-30",
  });
  assertEqual(res8.success, false, "Should fail scheduling");
  assertEqual(res8.needsClarification, true, "Should require user clarification");
  assertEqual(res8.occurrences.length, 0, "No occurrences should be generated");
  console.log("✅ PASS");

  // Test 9: Food association time offsets (After breakfast)
  console.log("\n🧪 Test 9: Food association time offsets");
  const res9 = generateSchedule({
    dosage: "1 pill",
    frequency: "twice daily",
    instructions: "after breakfast and after dinner",
    startDateStr: "2026-08-30",
  });
  assertEqual(res9.occurrences.map(o => o.scheduledTime), ["08:30", "20:30"], "Should delay default times to 08:30 and 20:30");
  console.log("✅ PASS");

  console.log("\n🎉 All Medicine Scheduling Engine Unit Tests passed successfully!");
}

runTests();
