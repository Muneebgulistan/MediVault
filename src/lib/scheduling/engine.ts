export interface ScheduledDoseOccurrence {
  scheduledTime: string;
  dosage: string;
  instructions: string | null;
}

export interface SchedulingResult {
  success: boolean;
  needsClarification: boolean;
  clarificationReason?: string;
  occurrences: ScheduledDoseOccurrence[];
  startDate: Date;
  endDate: Date | null;
  isAsNeeded: boolean;
}

/**
 * Parses duration string to determine end date from a start date.
 * Returns null if duration is ongoing or ambiguous.
 */
export function parseDuration(durationStr: string | null, startDate: Date): Date | null {
  if (!durationStr) return null;
  
  const normalized = durationStr.toLowerCase().trim();
  
  // Matches "for 5 days", "5 days", "5 day"
  const dayMatch = normalized.match(/(?:for\s+)?(\d+)\s*days?/);
  if (dayMatch) {
    const days = parseInt(dayMatch[1], 10);
    const end = new Date(startDate);
    end.setDate(end.getDate() + days - 1); // e.g. for 1 day, starts and ends on same day
    return end;
  }
  
  // Matches "for 2 weeks", "2 weeks", "2 week"
  const weekMatch = normalized.match(/(?:for\s+)?(\d+)\s*weeks?/);
  if (weekMatch) {
    const weeks = parseInt(weekMatch[1], 10);
    const end = new Date(startDate);
    end.setDate(end.getDate() + (weeks * 7) - 1);
    return end;
  }

  // Matches "for 1 month", "1 month"
  const monthMatch = normalized.match(/(?:for\s+)?(\d+)\s*months?/);
  if (monthMatch) {
    const months = parseInt(monthMatch[1], 10);
    const end = new Date(startDate);
    end.setMonth(end.getMonth() + months);
    end.setDate(end.getDate() - 1);
    return end;
  }

  return null;
}

/**
 * Deterministic scheduling engine that translates doctor instructions into time occurrences.
 * Strictly avoids inventing parameters, requesting clarification if ambiguous.
 */
export function generateSchedule(params: {
  dosage: string;
  frequency: string;
  instructions?: string | null;
  duration?: string | null;
  startDateStr?: string; // defaults to today
}): SchedulingResult {
  const startDate = params.startDateStr ? new Date(params.startDateStr) : new Date();
  // Clear time components for clean calendar boundaries
  startDate.setHours(0, 0, 0, 0);

  const freqLower = params.frequency.toLowerCase().trim();
  const instLower = (params.instructions || "").toLowerCase().trim();
  const dosage = params.dosage.trim();

  // 1. Check for "as needed" / PRN medication
  if (freqLower.includes("as needed") || freqLower.includes("prn") || instLower.includes("as needed") || instLower.includes("prn")) {
    return {
      success: true,
      needsClarification: false,
      occurrences: [], // As-needed medication has no scheduled slots
      startDate,
      endDate: parseDuration(params.duration || null, startDate),
      isAsNeeded: true,
    };
  }

  let times: string[] = [];
  let extraInstructions = params.instructions || null;

  // 2. Parse standard frequencies
  if (freqLower === "once daily" || freqLower === "daily" || freqLower === "once a day" || freqLower === "q.d." || freqLower === "qd") {
    // Determine morning or evening dose depending on bedtime instructions
    if (instLower.includes("bedtime") || instLower.includes("sleep") || instLower.includes("night")) {
      times = ["21:00"];
    } else if (instLower.includes("after breakfast") || instLower.includes("morning")) {
      times = ["08:30"];
    } else {
      times = ["08:00"]; // Default to morning
    }
  } else if (freqLower === "twice daily" || freqLower === "twice a day" || freqLower === "twice" || freqLower === "b.i.d." || freqLower === "bid") {
    if (instLower.includes("breakfast") && instLower.includes("dinner")) {
      times = ["08:30", "20:30"];
    } else {
      times = ["08:00", "20:00"]; // Default morning and evening
    }
  } else if (freqLower === "three times daily" || freqLower === "three times a day" || freqLower === "t.i.d." || freqLower === "tid") {
    times = ["08:00", "14:00", "20:00"];
  } else if (freqLower === "four times daily" || freqLower === "four times a day" || freqLower === "q.i.d." || freqLower === "qid") {
    times = ["08:00", "12:00", "16:00", "20:00"];
  } else if (freqLower === "before sleeping" || freqLower === "bedtime" || freqLower === "before sleep" || freqLower === "at bedtime") {
    times = ["21:00"];
  } else {
    // 3. Regex matching for "every N hours"
    const everyHourMatch = freqLower.match(/every\s+(\d+)\s*hours?/);
    if (everyHourMatch) {
      const hours = parseInt(everyHourMatch[1], 10);
      if (hours > 0 && hours <= 24) {
        // Generate intervals starting from 08:00 within 24 hours
        let currentHour = 8;
        for (let i = 0; i < 24; i += hours) {
          const hrString = String(currentHour % 24).padStart(2, "0");
          times.push(`${hrString}:00`);
          currentHour += hours;
        }
        // Sort times chronologically
        times.sort();
      }
    }
  }

  // 4. Adjust times for food associations in instructions
  if (times.length > 0) {
    times = times.map((t) => {
      if (instLower.includes("after breakfast") && t === "08:00") return "08:30";
      if (instLower.includes("after lunch") && t === "12:00") return "13:30";
      if (instLower.includes("after dinner") && t === "20:00") return "20:30";
      if (instLower.includes("before breakfast") && t === "08:00") return "07:30";
      if (instLower.includes("before lunch") && t === "12:00") return "11:30";
      if (instLower.includes("before dinner") && t === "20:00") return "19:30";
      return t;
    });
  }

  // 5. Check if we need clarification (could not parse or resolve times)
  if (times.length === 0 && !dosage) {
    return {
      success: false,
      needsClarification: true,
      clarificationReason: "Prescription lacks dosage information.",
      occurrences: [],
      startDate,
      endDate: null,
      isAsNeeded: false,
    };
  }

  if (times.length === 0) {
    return {
      success: false,
      needsClarification: true,
      clarificationReason: `Could not parse frequency or scheduling intervals from: "${params.frequency}".`,
      occurrences: [],
      startDate,
      endDate: null,
      isAsNeeded: false,
    };
  }

  // Generate occurrences
  const occurrences: ScheduledDoseOccurrence[] = times.map((time) => ({
    scheduledTime: time,
    dosage,
    instructions: extraInstructions,
  }));

  return {
    success: true,
    needsClarification: false,
    occurrences,
    startDate,
    endDate: parseDuration(params.duration || null, startDate),
    isAsNeeded: false,
  };
}
