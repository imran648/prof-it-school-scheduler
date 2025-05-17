
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WeekDay, TimeSlot } from '@/types';
import { WEEKDAYS, TIME_SLOTS } from '@/data/mockData';
import { CalendarIcon } from 'lucide-react';

const Schedule = () => {
  const { classrooms, bookings, getTimeSlotBookings } = useApp();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  const getDayName = (date: Date): WeekDay => {
    const dayIndex = date.getDay();
    // Convert from JavaScript's 0-6 (Sun-Sat) to 0-6 (Mon-Sun)
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    return WEEKDAYS[adjustedIndex] as WeekDay;
  };
  
  const navigateDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);
    setCurrentDate(newDate);
  };
  
  const currentFormattedDate = formatDate(currentDate);
  const currentDayName = getDayName(currentDate);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-profit-dark">Расписание кабинетов</h1>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigateDate(-1)}>
            &lt; Пред. день
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-md shadow-sm">
            <CalendarIcon className="w-5 h-5 text-profit-blue" />
            <span className="font-medium">
              {formatDisplayDate(currentDate)} ({currentDayName})
            </span>
          </div>
          <Button variant="outline" onClick={() => navigateDate(1)}>
            След. день &gt;
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="bg-profit-blue/10">
          <CardTitle className="text-xl text-profit-dark">
            Занятость кабинетов на {formatDisplayDate(currentDate)}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left font-medium text-gray-600">Время / Кабинет</th>
                  {classrooms.map((classroom) => (
                    <th key={classroom.id} className="p-3 text-left font-medium text-gray-600">
                      {classroom.name} (до {classroom.capacity} чел.)
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((timeSlot) => (
                  <tr key={timeSlot} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">
                      {timeSlot}
                    </td>
                    {classrooms.map((classroom) => {
                      const roomBookings = bookings.filter(
                        b => b.roomId === classroom.id && b.date === currentFormattedDate && b.startTime === timeSlot
                      );
                      
                      const isBooked = roomBookings.length > 0;
                      const booking = isBooked ? roomBookings[0] : null;
                      
                      return (
                        <td 
                          key={`${timeSlot}-${classroom.id}`} 
                          className={`p-3 ${isBooked ? 'class-occupied' : 'class-available'}`}
                        >
                          {isBooked ? (
                            <div>
                              <div className="font-bold">{booking?.title}</div>
                              <div className="text-sm opacity-80">{booking?.startTime} - {booking?.endTime}</div>
                            </div>
                          ) : (
                            <div className="text-center">Свободно</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Schedule;
