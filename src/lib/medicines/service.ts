export interface MedicineInfo {
  id: string;
  name: string;
  dosage: string;
  instructions?: string;
}

export interface ScheduleItem {
  id: string;
  medicineName: string;
  timeOfDay: string;
  taken: boolean;
}

export async function searchMedicines(_query: string): Promise<MedicineInfo[]> {
  return [];
}

export function generateTimetable(_medicines: MedicineInfo[]): ScheduleItem[] {
  return [];
}
