
import { Teacher, Group, ClassRoom, ClassRoomBooking, Student, WeekDay, TimeSlot } from '../types';

export const WEEKDAYS: WeekDay[] = [
  'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'
];

export const TIME_SLOTS: TimeSlot[] = [
  '09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30'
];

export const teachers: Teacher[] = [
  { id: '1', name: 'Иванов Иван', subject: 'Программирование', groups: ['1', '2'] },
  { id: '2', name: 'Петрова Елена', subject: 'Web-разработка', groups: ['3'] },
  { id: '3', name: 'Сидоров Алексей', subject: 'Дизайн', groups: ['4', '5'] },
];

export const classrooms: ClassRoom[] = [
  { id: '1', name: 'Кабинет 101', capacity: 15 },
  { id: '2', name: 'Кабинет 102', capacity: 20 },
  { id: '3', name: 'Кабинет 103', capacity: 10 },
];

export const students: Student[] = [
  { id: '1', name: 'Козлов Артем', contacts: '+7 (900) 123-45-67', groupId: '1' },
  { id: '2', name: 'Морозова Анна', contacts: '+7 (900) 765-43-21', groupId: '1' },
  { id: '3', name: 'Волков Дмитрий', contacts: '+7 (900) 111-22-33', groupId: '2' },
  { id: '4', name: 'Зайцева Мария', contacts: '+7 (900) 444-55-66', groupId: '2' },
  { id: '5', name: 'Соколов Игорь', contacts: '+7 (900) 777-88-99', groupId: '3' },
];

export const groups: Group[] = [
  {
    id: '1',
    name: 'Программирование 1',
    teacherId: '1',
    schedule: [
      { id: '1-1', day: 'Понедельник', startTime: '15:00', endTime: '16:30', roomId: '1' },
      { id: '1-2', day: 'Четверг', startTime: '15:00', endTime: '16:30', roomId: '1' },
    ],
    startDate: '2025-01-15',
    endDate: '2025-05-15',
    totalLessons: 32,
    completedLessons: 8,
    students: students.filter(s => s.groupId === '1'),
    lastPaymentDate: '2025-04-15',
  },
  {
    id: '2',
    name: 'Программирование 2',
    teacherId: '1',
    schedule: [
      { id: '2-1', day: 'Вторник', startTime: '16:30', endTime: '18:00', roomId: '2' },
      { id: '2-2', day: 'Пятница', startTime: '16:30', endTime: '18:00', roomId: '2' },
    ],
    startDate: '2025-02-01',
    endDate: '2025-06-01',
    totalLessons: 32,
    completedLessons: 6,
    students: students.filter(s => s.groupId === '2'),
    lastPaymentDate: '2025-04-01',
  },
  {
    id: '3',
    name: 'Web-разработка 1',
    teacherId: '2',
    schedule: [
      { id: '3-1', day: 'Среда', startTime: '18:00', endTime: '19:30', roomId: '3' },
      { id: '3-2', day: 'Суббота', startTime: '12:00', endTime: '13:30', roomId: '3' },
    ],
    startDate: '2025-03-01',
    endDate: '2025-07-01',
    totalLessons: 32,
    completedLessons: 4,
    students: students.filter(s => s.groupId === '3'),
    lastPaymentDate: '2025-04-10',
  },
];

// Generate bookings for the current week based on group schedules
const today = new Date();
const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
const startOfWeek = new Date(today);
startOfWeek.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1)); // Adjust to Monday

export const generateBookingsForWeek = (): ClassRoomBooking[] => {
  const bookings: ClassRoomBooking[] = [];
  
  groups.forEach(group => {
    group.schedule.forEach(session => {
      const dayIndex = WEEKDAYS.indexOf(session.day as WeekDay);
      if (dayIndex !== -1) {
        const sessionDate = new Date(startOfWeek);
        sessionDate.setDate(startOfWeek.getDate() + dayIndex);
        
        const bookingDate = sessionDate.toISOString().split('T')[0];
        
        bookings.push({
          id: `booking-${group.id}-${bookingDate}-${session.startTime}`,
          roomId: session.roomId,
          groupId: group.id,
          date: bookingDate,
          startTime: session.startTime,
          endTime: session.endTime,
          title: group.name,
          teachers: [group.teacherId],
        });
      }
    });
  });
  
  return bookings;
};

export const roomBookings: ClassRoomBooking[] = generateBookingsForWeek();
