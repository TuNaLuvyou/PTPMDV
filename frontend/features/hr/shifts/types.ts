export interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface WorkShift {
  id: string;
  employee: string;
  branch: string;
  date: string;
  templateName: string;
  scheduled: string;
  checkIn: string;
  checkOut: string;
  status: "Đúng giờ" | "Trễ" | "Về sớm" | "Chưa làm";
  note?: string;
}
