import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  Teacher, Group, ClassRoom, ClassRoomBooking, Student, Attendance, 
  ViewMode, Payment, PaymentStatus
} from '../types';
import { 
  teachers as initialTeachers, 
  groups as initialGroups, 
  classrooms as initialClassrooms,
  students as initialStudents,
  roomBookings as initialBookings
} from '../data/mockData';
import { useToast } from '@/hooks/use-toast';
import { format, addMonths } from 'date-fns';

// Ключи для локального хранилища
const STORAGE_KEYS = {
  TEACHERS: 'profit_teachers',
  GROUPS: 'profit_groups',
  CLASSROOMS: 'profit_classrooms',
  STUDENTS: 'profit_students',
  BOOKINGS: 'profit_bookings',
  ATTENDANCE: 'profit_attendance',
  PAYMENTS: 'profit_payments',
  SELECTED_TEACHER: 'profit_selected_teacher',
  VIEW_MODE: 'profit_view_mode'
};

interface AppContextType {
  teachers: Teacher[];
  groups: Group[];
  classrooms: ClassRoom[];
  students: Student[];
  bookings: ClassRoomBooking[];
  attendanceRecords: Attendance[];
  selectedTeacherId: string;
  viewMode: ViewMode;
  payments: Payment[];
  setViewMode: (mode: ViewMode) => void;
  setSelectedTeacherId: (id: string) => void;
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (teacher: Teacher) => void;
  deleteTeacher: (teacherId: string) => void;
  addClassroom: (classroom: Omit<ClassRoom, 'id'>) => void;
  updateClassroom: (classroom: ClassRoom) => void;
  deleteClassroom: (classroomId: string) => void;
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
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePaymentStatus: (paymentId: string, status: PaymentStatus) => void;
  getStudentPayments: (studentId: string) => Payment[];
  getGroupPayments: (groupId: string) => Payment[];
  generatePaymentPeriods: (groupId: string) => void;
  getTeacherGroups: (teacherId: string) => Group[];
  getGroupStudents: (groupId: string) => Student[];
  getRoomBookings: (roomId: string, date?: string) => ClassRoomBooking[];
  getTimeSlotBookings: (date: string, timeSlot: string) => ClassRoomBooking[];
  getBookingsByDateRange: (startDate: string, endDate: string) => ClassRoomBooking[];
  getClassroomBookings: (roomId: string, startDate: string, endDate: string) => ClassRoomBooking[];
  getGroupAttendance: (groupId: string) => Attendance[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Загрузка данных из localStorage или использование начальных значений
  const loadFromStorage = <T,>(key: string, initialData: T): T => {
    try {
      const storedData = localStorage.getItem(key);
      return storedData ? JSON.parse(storedData) : initialData;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialData;
    }
  };

  const [teachers, setTeachers] = useState<Teacher[]>(() => 
    loadFromStorage(STORAGE_KEYS.TEACHERS, initialTeachers));
  
  const [groups, setGroups] = useState<Group[]>(() => 
    loadFromStorage(STORAGE_KEYS.GROUPS, initialGroups.map(group => ({ ...group, paymentPeriod: 8 }))));
  
  const [classrooms, setClassrooms] = useState<ClassRoom[]>(() => 
    loadFromStorage(STORAGE_KEYS.CLASSROOMS, initialClassrooms));
  
  const [students, setStudents] = useState<Student[]>(() => 
    loadFromStorage(STORAGE_KEYS.STUDENTS, initialStudents));
  
  const [bookings, setBookings] = useState<ClassRoomBooking[]>(() => 
    loadFromStorage(STORAGE_KEYS.BOOKINGS, initialBookings));
  
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>(() => 
    loadFromStorage(STORAGE_KEYS.ATTENDANCE, []));
  
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(() => 
    loadFromStorage(STORAGE_KEYS.SELECTED_TEACHER, ''));
  
  const [viewMode, setViewMode] = useState<ViewMode>(() => 
    loadFromStorage(STORAGE_KEYS.VIEW_MODE, 'day'));
  
  const [payments, setPayments] = useState<Payment[]>(() => 
    loadFromStorage(STORAGE_KEYS.PAYMENTS, []));
  
  const { toast } = useToast();

  // Сохранение данных в localStorage при изменении
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(classrooms));
  }, [classrooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_TEACHER, JSON.stringify(selectedTeacherId));
  }, [selectedTeacherId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, JSON.stringify(viewMode));
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  // Teacher management
  const addTeacher = (newTeacher: Omit<Teacher, 'id'>) => {
    const id = Date.now().toString();
    const teacher = { ...newTeacher, id };
    setTeachers([...teachers, teacher as Teacher]);
    toast({
      title: "Преподаватель добавлен",
      description: `${newTeacher.name} успешно добавлен.`,
    });
  };

  const updateTeacher = (updatedTeacher: Teacher) => {
    setTeachers(teachers.map(teacher => teacher.id === updatedTeacher.id ? updatedTeacher : teacher));
    toast({
      title: "Данные преподавателя обновлены",
      description: `Данные ${updatedTeacher.name} успешно обновлены.`,
    });
  };

  const deleteTeacher = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    setTeachers(teachers.filter(teacher => teacher.id !== teacherId));
    if (teacher) {
      toast({
        title: "Преподаватель удален",
        description: `${teacher.name} успешно удален.`,
      });
    }
  };

  // Classroom management
  const addClassroom = (newClassroom: Omit<ClassRoom, 'id'>) => {
    const id = Date.now().toString();
    const classroom = { ...newClassroom, id, isActive: true };
    setClassrooms([...classrooms, classroom as ClassRoom]);
    toast({
      title: "Кабинет добавлен",
      description: `Кабинет ${newClassroom.name} успешно добавлен.`,
    });
  };

  const updateClassroom = (updatedClassroom: ClassRoom) => {
    setClassrooms(classrooms.map(classroom => 
      classroom.id === updatedClassroom.id ? updatedClassroom : classroom
    ));
    toast({
      title: "Данные кабинета обновлены",
      description: `Данные кабинета ${updatedClassroom.name} успешно обновлены.`,
    });
  };

  const deleteClassroom = (classroomId: string) => {
    const classroom = classrooms.find(c => c.id === classroomId);
    setClassrooms(classrooms.filter(classroom => classroom.id !== classroomId));
    if (classroom) {
      toast({
        title: "Кабинет удален",
        description: `Кабинет ${classroom.name} успешно удален.`,
      });
    }
  };

  // Group management
  const addGroup = (newGroup: Omit<Group, 'id'>) => {
    const id = Date.now().toString();
    const group = { 
      ...newGroup, 
      id, 
      paymentPeriod: newGroup.paymentPeriod || 8,
      paymentType: newGroup.paymentType || 'perLesson',
      monthlyFee: newGroup.monthlyFee || 10000,
    };
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
    
    // Удалить все связанные данные
    const updatedStudents = students.filter(student => student.groupId !== groupId);
    const updatedBookings = bookings.filter(booking => booking.groupId !== groupId);
    const updatedPayments = payments.filter(payment => {
      const student = students.find(s => s.id === payment.studentId);
      return !student || student.groupId !== groupId;
    });
    const updatedAttendance = attendanceRecords.filter(record => record.groupId !== groupId);
    
    setStudents(updatedStudents);
    setBookings(updatedBookings);
    setPayments(updatedPayments);
    setAttendanceRecords(updatedAttendance);
    setGroups(groups.filter(group => group.id !== groupId));
    
    if (group) {
      toast({
        title: "Группа удалена",
        description: `Группа ${group.name} успешно удалена.`,
      });
    }
  };

  // Student management
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

  // Booking management
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

  // Attendance management
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

  // Payment management
  const addPayment = (newPayment: Omit<Payment, 'id'>) => {
    const id = Date.now().toString();
    const payment = { ...newPayment, id };
    setPayments(prevPayments => {
      // Check if payment already exists to avoid duplicates
      const paymentExists = prevPayments.some(p => 
        p.studentId === newPayment.studentId && 
        p.lessonStart === newPayment.lessonStart && 
        p.lessonEnd === newPayment.lessonEnd
      );
      
      if (paymentExists) {
        return prevPayments;
      }
      
      const updatedPayments = [...prevPayments, payment as Payment];
      // Ensure storage is updated
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(updatedPayments));
      return updatedPayments;
    });
  };

  const updatePaymentStatus = (paymentId: string, status: PaymentStatus) => {
    setPayments(prevPayments => {
      const updatedPayments = prevPayments.map(payment => {
        if (payment.id === paymentId) {
          const updatedPayment = { ...payment, status };
          toast({
            title: "Статус оплаты обновлен",
            description: `Платеж ${payment.id} теперь имеет статус: ${status}.`,
          });
          return updatedPayment;
        }
        return payment;
      });
      
      // Ensure storage is updated immediately
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(updatedPayments));
      return updatedPayments;
    });
  };

  const getStudentPayments = (studentId: string) => {
    return payments.filter(payment => payment.studentId === studentId);
  };

  const getGroupPayments = (groupId: string) => {
    const groupStudentIds = students
      .filter(student => student.groupId === groupId)
      .map(student => student.id);
    
    return payments.filter(payment => groupStudentIds.includes(payment.studentId));
  };

  // Создание периодов оплаты для группы
  const generatePaymentPeriods = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    const groupStudents = getGroupStudents(groupId);
    
    const newPayments: Omit<Payment, 'id'>[] = [];
    
    // Генерируем платежи в зависимости от типа оплаты
    if (group.paymentType === 'perLesson') {
      const paymentPeriod = group.paymentPeriod || 8;
      
      // Создаем платежи для всех студентов на основе количества уроков
      groupStudents.forEach(student => {
        // Для каждого полного периода создаем платеж
        for (let i = 0; i < group.totalLessons; i += paymentPeriod) {
          const lessonStart = i + 1;
          const lessonEnd = Math.min(i + paymentPeriod, group.totalLessons);
          
          // Проверяем, существует ли уже такой платеж
          const existingPayment = payments.find(p => 
            p.studentId === student.id && 
            p.lessonStart === lessonStart && 
            p.lessonEnd === lessonEnd
          );
          
          if (!existingPayment) {
            // Создаем платеж, если не существует
            const period = `Занятия ${lessonStart}-${lessonEnd}`;
            
            // Определяем статус платежа
            let status: PaymentStatus = 'pending';
            if (group.completedLessons >= lessonEnd) {
              status = 'overdue'; // Занятия уже прошли, оплата просрочена
            } else if (group.completedLessons >= lessonStart) {
              status = 'pending'; // Текущий период, оплата ожидается
            }
            
            newPayments.push({
              studentId: student.id,
              amount: 10000, // Условная сумма
              date: new Date().toISOString().split('T')[0],
              status: status,
              period: period,
              lessonStart: lessonStart,
              lessonEnd: lessonEnd
            });
          }
        }
      });
    } else { // monthly payments
      // Определяем количество месяцев между датами начала и окончания
      const startDate = new Date(group.startDate);
      const endDate = new Date(group.endDate);
      
      let currentDate = new Date(startDate);
      const monthlyAmount = group.monthlyFee || 10000;
      
      // Создаем платежи для всех месяцев
      while (currentDate <= endDate) {
        const month = format(currentDate, 'yyyy-MM');
        const monthName = format(currentDate, 'MMMM yyyy');
        
        groupStudents.forEach(student => {
          // Проверяем, существует ли уже такой платеж
          const existingPayment = payments.find(p => 
            p.studentId === student.id && 
            p.month === month
          );
          
          if (!existingPayment) {
            // Создаем ежемесячный платеж
            newPayments.push({
              studentId: student.id,
              amount: monthlyAmount,
              date: new Date().toISOString().split('T')[0],
              status: 'pending',
              period: monthName,
              month: month
            });
          }
        });
        
        // Переходим к следующему месяцу
        currentDate = addMonths(currentDate, 1);
      }
    }
    
    // Добавляем все новые платежи
    if (newPayments.length > 0) {
      newPayments.forEach(payment => addPayment(payment));
      
      toast({
        title: "Периоды оплаты сгенерированы",
        description: `Периоды оплаты для группы ${group.name} успешно сгенерированы.`,
      });
    }
  };

  // Data access functions
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

  const getBookingsByDateRange = (startDate: string, endDate: string) => {
    return bookings.filter(booking => 
      booking.date >= startDate && booking.date <= endDate
    );
  };

  const getClassroomBookings = (roomId: string, startDate: string, endDate: string) => {
    return bookings.filter(booking => 
      booking.roomId === roomId && 
      booking.date >= startDate && 
      booking.date <= endDate
    );
  };

  const getGroupAttendance = (groupId: string) => {
    return attendanceRecords.filter(record => record.groupId === groupId);
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
      viewMode,
      payments,
      setViewMode,
      setSelectedTeacherId,
      addTeacher,
      updateTeacher,
      deleteTeacher,
      addClassroom,
      updateClassroom,
      deleteClassroom,
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
      addPayment,
      updatePaymentStatus,
      getStudentPayments,
      getGroupPayments,
      generatePaymentPeriods,
      getTeacherGroups,
      getGroupStudents,
      getRoomBookings,
      getTimeSlotBookings,
      getBookingsByDateRange,
      getClassroomBookings,
      getGroupAttendance
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
