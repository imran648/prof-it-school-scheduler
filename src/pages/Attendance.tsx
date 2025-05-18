
import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Group, Student, Attendance as AttendanceType, WeekDay } from '@/types';
import { CheckIcon, XIcon, CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { WEEKDAYS } from '../data/mockData';

const Attendance = () => {
  const { 
    selectedTeacherId, groups, getTeacherGroups, getGroupStudents, 
    attendanceRecords, recordAttendance
  } = useApp();
  
  const [teacherGroups, setTeacherGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [formattedDate, setFormattedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [presentStudents, setPresentStudents] = useState<string[]>([]);
  const [absentStudents, setAbsentStudents] = useState<string[]>([]);
  const [classDates, setClassDates] = useState<Date[]>([]);
  
  const { toast } = useToast();
  
  useEffect(() => {
    if (selectedTeacherId) {
      const filteredGroups = getTeacherGroups(selectedTeacherId);
      setTeacherGroups(filteredGroups);
      
      if (filteredGroups.length > 0 && !selectedGroup) {
        setSelectedGroup(filteredGroups[0]);
      }
    }
  }, [selectedTeacherId, groups, selectedGroup]);
  
  // Обновляем строковое представление даты при изменении объекта Date
  useEffect(() => {
    if (date) {
      const newFormattedDate = date.toISOString().split('T')[0];
      setFormattedDate(newFormattedDate);
    }
  }, [date]);
  
  // Обновляем списки посещаемости при выборе группы или изменении даты
  useEffect(() => {
    if (selectedGroup) {
      const students = getGroupStudents(selectedGroup.id);
      
      // Check if attendance record exists
      const existingRecord = attendanceRecords.find(
        record => record.groupId === selectedGroup.id && record.date === formattedDate
      );
      
      if (existingRecord) {
        setPresentStudents(existingRecord.presentStudents);
        setAbsentStudents(existingRecord.absentStudents);
      } else {
        // Default: all students present
        setPresentStudents(students.map(s => s.id));
        setAbsentStudents([]);
      }
    }
  }, [selectedGroup, formattedDate, attendanceRecords]);
  
  // Определяем даты занятий для выбранной группы
  useEffect(() => {
    if (selectedGroup) {
      const dates: Date[] = [];
      const today = new Date();
      const currentDay = today.getDay(); // 0 - воскресенье, 1 - понедельник
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1)); // Начало недели - понедельник
      
      // Добавляем 4 недели вперед для отображения в календаре
      for (let week = 0; week < 4; week++) {
        selectedGroup.schedule.forEach(session => {
          const dayIndex = WEEKDAYS.indexOf(session.day as WeekDay);
          if (dayIndex !== -1) {
            const sessionDate = new Date(startOfWeek);
            sessionDate.setDate(startOfWeek.getDate() + dayIndex + (week * 7));
            dates.push(sessionDate);
          }
        });
      }
      
      // Добавляем 4 недели назад для отображения в календаре
      for (let week = 1; week <= 4; week++) {
        selectedGroup.schedule.forEach(session => {
          const dayIndex = WEEKDAYS.indexOf(session.day as WeekDay);
          if (dayIndex !== -1) {
            const sessionDate = new Date(startOfWeek);
            sessionDate.setDate(startOfWeek.getDate() + dayIndex - (week * 7));
            dates.push(sessionDate);
          }
        });
      }
      
      setClassDates(dates);
    }
  }, [selectedGroup]);
  
  const handleToggleAttendance = (studentId: string) => {
    if (presentStudents.includes(studentId)) {
      setPresentStudents(presentStudents.filter(id => id !== studentId));
      setAbsentStudents([...absentStudents, studentId]);
    } else {
      setAbsentStudents(absentStudents.filter(id => id !== studentId));
      setPresentStudents([...presentStudents, studentId]);
    }
  };
  
  const handleSaveAttendance = () => {
    if (!selectedGroup) return;
    
    const sessionId = `${selectedGroup.id}-${formattedDate}`;
    
    recordAttendance({
      sessionId,
      date: formattedDate,
      groupId: selectedGroup.id,
      presentStudents,
      absentStudents
    });
    
    toast({
      title: "Посещаемость сохранена",
      description: `Записано для группы ${selectedGroup.name} на ${new Date(formattedDate).toLocaleDateString('ru-RU')}`
    });
  };
  
  // Создаем модифицированный компонент календаря с подсветкой дней занятий
  const CustomCalendar = () => (
    <Calendar
      mode="single"
      selected={date}
      onSelect={(newDate) => newDate && setDate(newDate)}
      initialFocus
      className={cn("p-3 pointer-events-auto")}
      modifiers={{
        classDay: classDates,
      }}
      modifiersClassNames={{
        classDay: "bg-profit-blue/20 text-profit-dark font-medium rounded-md",
      }}
      locale={ru}
    />
  );
  
  if (!selectedTeacherId) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Card className="w-full max-w-md p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Учет посещаемости</h2>
          <p className="text-gray-500 mb-6">Пожалуйста, выберите преподавателя в выпадающем меню в верхней части страницы.</p>
        </Card>
      </div>
    );
  }
  
  if (teacherGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Card className="w-full max-w-md p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Нет групп</h2>
          <p className="text-gray-500 mb-6">У вас пока нет учебных групп для отметки посещаемости.</p>
        </Card>
      </div>
    );
  }
  
  const students = selectedGroup ? getGroupStudents(selectedGroup.id) : [];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-profit-dark">Учет посещаемости</h1>
      </div>
      
      <Card>
        <CardHeader className="bg-profit-blue/10">
          <CardTitle>Отметить посещаемость</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Выберите группу
                </label>
                <Select 
                  value={selectedGroup?.id || ''} 
                  onValueChange={(value) => {
                    const group = teacherGroups.find(g => g.id === value);
                    setSelectedGroup(group || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите группу" />
                  </SelectTrigger>
                  <SelectContent>
                    {teacherGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата занятия
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? (
                        format(date, "PPP", { locale: ru })
                      ) : (
                        <span>Выберите дату</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CustomCalendar />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {selectedGroup && students.length > 0 ? (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left">Студент</th>
                        <th className="px-4 py-2 text-left">Статус</th>
                        <th className="px-4 py-2 text-center">Присутствие</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => {
                        const isPresent = presentStudents.includes(student.id);
                        
                        return (
                          <tr key={student.id} className="border-t">
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-medium">{student.name}</div>
                                <div className="text-sm text-gray-500">{student.contacts}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {isPresent ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckIcon className="w-3 h-3 mr-1" /> Присутствует
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <XIcon className="w-3 h-3 mr-1" /> Отсутствует
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Checkbox
                                checked={isPresent}
                                onCheckedChange={() => handleToggleAttendance(student.id)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    Присутствует: {presentStudents.length} из {students.length} студентов
                  </div>
                  
                  <Button onClick={handleSaveAttendance}>
                    Сохранить посещаемость
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
                <p>Нет студентов в выбранной группе</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;
