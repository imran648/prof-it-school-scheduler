
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Teacher, Group, ClassRoom, ClassRoomBooking, Student, Attendance
} from '../types';
import { 
  teachers as initialTeachers, 
  groups as initialGroups, 
  classrooms as initialClassrooms,
  students as initialStudents,
  roomBookings as initialBookings
} from '../data/mockData';
import { useToast } from '@/hooks/use-toast';

interface AppContextType {
  teachers: Teacher[];
  groups: Group[];
  classrooms: ClassRoom[];
  students: Student[];
  bookings: ClassRoomBooking[];
  attendanceRecords: Attendance[];
  selectedTeacherId: string;
  setSelectedTeacherId: (id: string) => void;
  addGroup: (group: Omit<Group, 'id'>) => void;
  updateGroup: (group: Group) => void;
  deleteGroup: (groupId: string) => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  removeStudent: (studentId: string) => void;
  addBooking: (booking: Omit<ClassRoomBooking, 'id'>) => void;
  updateBooking: (booking: ClassRoomBooking) => void;
  deleteBooking: (bookingId: string) => void;
  recordAttendance: (attendance: Attendance) => void;
  getTeacherGroups: (teacherId: string) => Group[];
  getGroupStudents: (groupId: string) => Student[];
  getRoomBookings: (roomId: string, date?: string) => ClassRoomBooking[];
  getTimeSlotBookings: (date: string, timeSlot: string) => ClassRoomBooking[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [classrooms, setClassrooms] = useState<ClassRoom[]>(initialClassrooms);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [bookings, setBookings] = useState<ClassRoomBooking[]>(initialBookings);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  
  const { toast } = useToast();

  const addGroup = (newGroup: Omit<Group, 'id'>) => {
    const id = Date.now().toString();
    const group = { ...newGroup, id };
    setGroups([...groups, group as Group]);
    toast({
      title: "Группа создана",
      description: `Группа ${newGroup.name} успешно создана.`,
    });
  };

  const updateGroup = (updatedGroup: Group) => {
    setGroups(groups.map(group => group.id === updatedGroup.id ? updatedGroup : group));
    toast({
      title: "Группа обновлена",
      description: `Группа ${updatedGroup.name} успешно обновлена.`,
    });
  };

  const deleteGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    setGroups(groups.filter(group => group.id !== groupId));
    if (group) {
      toast({
        title: "Группа удалена",
        description: `Группа ${group.name} успешно удалена.`,
      });
    }
  };

  const addStudent = (newStudent: Omit<Student, 'id'>) => {
    const id = Date.now().toString();
    const student = { ...newStudent, id };
    setStudents([...students, student as Student]);
    toast({
      title: "Студент добавлен",
      description: `${newStudent.name} успешно добавлен в группу.`,
    });
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents(students.map(student => student.id === updatedStudent.id ? updatedStudent : student));
    toast({
      title: "Данные студента обновлены",
      description: `Данные ${updatedStudent.name} успешно обновлены.`,
    });
  };

  const removeStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setStudents(students.filter(student => student.id !== studentId));
    if (student) {
      toast({
        title: "Студент удален",
        description: `${student.name} успешно удален из группы.`,
      });
    }
  };

  const addBooking = (newBooking: Omit<ClassRoomBooking, 'id'>) => {
    const id = Date.now().toString();
    const booking = { ...newBooking, id };
    setBookings([...bookings, booking as ClassRoomBooking]);
    toast({
      title: "Бронирование создано",
      description: `Кабинет забронирован на ${newBooking.date} с ${newBooking.startTime} до ${newBooking.endTime}.`,
    });
  };

  const updateBooking = (updatedBooking: ClassRoomBooking) => {
    setBookings(bookings.map(booking => booking.id === updatedBooking.id ? updatedBooking : booking));
    toast({
      title: "Бронирование обновлено",
      description: `Бронирование успешно обновлено.`,
    });
  };

  const deleteBooking = (bookingId: string) => {
    setBookings(bookings.filter(booking => booking.id !== bookingId));
    toast({
      title: "Бронирование удалено",
      description: `Бронирование кабинета успешно удалено.`,
    });
  };

  const recordAttendance = (attendance: Attendance) => {
    const exists = attendanceRecords.findIndex(
      record => record.sessionId === attendance.sessionId && record.date === attendance.date
    );
    
    if (exists !== -1) {
      setAttendanceRecords(
        attendanceRecords.map((record, index) => index === exists ? attendance : record)
      );
    } else {
      setAttendanceRecords([...attendanceRecords, attendance]);
    }
    
    toast({
      title: "Посещаемость записана",
      description: `Посещаемость для группы записана.`,
    });
  };

  const getTeacherGroups = (teacherId: string) => {
    return groups.filter(group => group.teacherId === teacherId);
  };

  const getGroupStudents = (groupId: string) => {
    return students.filter(student => student.groupId === groupId);
  };

  const getRoomBookings = (roomId: string, date?: string) => {
    return date 
      ? bookings.filter(booking => booking.roomId === roomId && booking.date === date)
      : bookings.filter(booking => booking.roomId === roomId);
  };

  const getTimeSlotBookings = (date: string, timeSlot: string) => {
    return bookings.filter(
      booking => booking.date === date && booking.startTime === timeSlot
    );
  };

  return (
    <AppContext.Provider value={{
      teachers,
      groups,
      classrooms,
      students,
      bookings,
      attendanceRecords,
      selectedTeacherId,
      setSelectedTeacherId,
      addGroup,
      updateGroup,
      deleteGroup,
      addStudent,
      updateStudent,
      removeStudent,
      addBooking,
      updateBooking,
      deleteBooking,
      recordAttendance,
      getTeacherGroups,
      getGroupStudents,
      getRoomBookings,
      getTimeSlotBookings
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
