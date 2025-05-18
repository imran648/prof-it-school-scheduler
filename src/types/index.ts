
export interface Teacher {
  id: string;
  name: string;
  subject: string;
  groups: string[];
  email?: string;
  phone?: string;
  photoUrl?: string;
}

export interface Student {
  id: string;
  name: string;
  contacts: string;
  groupId: string;
  payments?: Payment[];
}

export interface Group {
  id: string;
  name: string;
  teacherId: string;
  schedule: ClassSession[];
  startDate: string;
  endDate: string;
  totalLessons: number;
  completedLessons: number;
  students: Student[];
  lastPaymentDate: string;
  paymentPeriod: number; // количество занятий между оплатами
}

export interface ClassSession {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  roomId: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  capacity: number;
  equipment?: string[];
  location?: string;
  isActive?: boolean;
}

export interface ClassRoomBooking {
  id: string;
  roomId: string;
  groupId: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  teachers: string[];
}

export interface Attendance {
  sessionId: string;
  date: string;
  groupId: string;
  presentStudents: string[];
  absentStudents: string[];
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  period: string; // Например, "Занятия 1-8"
  lessonStart: number;
  lessonEnd: number;
}

export type PaymentStatus = 'pending' | 'confirmed' | 'overdue';
export type WeekDay = 'Понедельник' | 'Вторник' | 'Среда' | 'Четверг' | 'Пятница' | 'Суббота' | 'Воскресенье';
export type TimeSlot = '09:00' | '10:30' | '12:00' | '13:30' | '15:00' | '16:30' | '18:00' | '19:30';
export type ViewMode = 'day' | 'week' | 'month';
