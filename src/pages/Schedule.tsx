
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WeekDay, TimeSlot, ViewMode } from '@/types';
import { WEEKDAYS, TIME_SLOTS } from '@/data/mockData';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, addWeeks, addMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useLocation } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Schedule = () => {
  const { classrooms, bookings, getTimeSlotBookings, getClassroomBookings, viewMode, setViewMode } = useApp();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');
  const location = useLocation();
  
  useEffect(() => {
    // Check if we have a roomId from navigation
    if (location.state && location.state.roomId) {
      setSelectedRoomId(location.state.roomId);
    }
  }, [location.state]);
  
  const formatDate = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };
  
  const formatDisplayDate = (date: Date): string => {
    return format(date, 'd MMMM yyyy', { locale: ru });
  };
  
  const getDayName = (date: Date): WeekDay => {
    const day = format(date, 'EEEE', { locale: ru });
    return day.charAt(0).toUpperCase() + day.slice(1) as WeekDay;
  };
  
  const navigateDate = (amount: number) => {
    let newDate = currentDate;
    switch (viewMode) {
      case 'day':
        newDate = addDays(currentDate, amount);
        break;
      case 'week':
        newDate = addWeeks(currentDate, amount);
        break;
      case 'month':
        newDate = addMonths(currentDate, amount);
        break;
    }
    setCurrentDate(newDate);
  };
  
  // Get date range based on current view mode
  const getDateRange = () => {
    switch (viewMode) {
      case 'day':
        return {
          start: currentDate,
          end: currentDate,
          title: `${formatDisplayDate(currentDate)} (${getDayName(currentDate)})`
        };
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return {
          start: weekStart,
          end: weekEnd,
          title: `${formatDisplayDate(weekStart)} - ${formatDisplayDate(weekEnd)}`
        };
      case 'month':
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        return {
          start: monthStart,
          end: monthEnd,
          title: format(currentDate, 'LLLL yyyy', { locale: ru })
        };
    }
  };
  
  const dateRange = getDateRange();
  const daysInRange = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });

  // Generate schedule data for the current view
  const getFilteredBookings = () => {
    const startDate = formatDate(dateRange.start);
    const endDate = formatDate(dateRange.end);
    
    if (selectedRoomId === 'all') {
      return bookings.filter(booking => 
        booking.date >= startDate && 
        booking.date <= endDate
      );
    } else {
      return bookings.filter(booking => 
        booking.roomId === selectedRoomId && 
        booking.date >= startDate && 
        booking.date <= endDate
      );
    }
  };
  
  const filteredBookings = getFilteredBookings();

  // Render day view
  const renderDayView = () => {
    const currentFormattedDate = formatDate(currentDate);
    return (
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="p-3 text-left font-medium text-gray-600">Время / Кабинет</th>
            {selectedRoomId === 'all' ? (
              classrooms.map((classroom) => (
                <th key={classroom.id} className="p-3 text-left font-medium text-gray-600">
                  {classroom.name} (до {classroom.capacity} чел.)
                </th>
              ))
            ) : (
              <th className="p-3 text-left font-medium text-gray-600">
                {classrooms.find(c => c.id === selectedRoomId)?.name || 'Кабинет'}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map((timeSlot) => (
            <tr key={timeSlot} className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">
                {timeSlot}
              </td>
              {selectedRoomId === 'all' ? (
                classrooms.map((classroom) => {
                  const roomBookings = bookings.filter(
                    b => b.roomId === classroom.id && b.date === currentFormattedDate && b.startTime === timeSlot
                  );
                  
                  const isBooked = roomBookings.length > 0;
                  const booking = isBooked ? roomBookings[0] : null;
                  
                  return (
                    <td 
                      key={`${timeSlot}-${classroom.id}`} 
                      className={`p-3 ${isBooked ? 'bg-profit-blue/10' : 'bg-profit-green/10'}`}
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
                })
              ) : (
                <td className="p-3">
                  {(() => {
                    const roomBookings = bookings.filter(
                      b => b.roomId === selectedRoomId && b.date === currentFormattedDate && b.startTime === timeSlot
                    );
                    
                    const isBooked = roomBookings.length > 0;
                    const booking = isBooked ? roomBookings[0] : null;
                    
                    return isBooked ? (
                      <div>
                        <div className="font-bold">{booking?.title}</div>
                        <div className="text-sm opacity-80">{booking?.startTime} - {booking?.endTime}</div>
                      </div>
                    ) : (
                      <div className="text-center">Свободно</div>
                    );
                  })()}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
  // Render week view
  const renderWeekView = () => (
    <div className="grid grid-cols-7 gap-1">
      {daysInRange.map((day, index) => {
        const dayFormatted = formatDate(day);
        const dayName = format(day, 'EEE', { locale: ru });
        const dayNumber = format(day, 'd');
        const dayBookings = filteredBookings.filter(b => b.date === dayFormatted);
        
        return (
          <div key={index} className="border rounded-lg overflow-hidden">
            <div className="bg-profit-blue/10 p-2 text-center">
              <div className="font-medium">{dayName}</div>
              <div className="text-lg font-bold">{dayNumber}</div>
            </div>
            
            <div className="p-2 min-h-[200px]">
              {dayBookings.length > 0 ? (
                <div className="space-y-2">
                  {dayBookings.map(booking => (
                    <div key={booking.id} className="bg-profit-blue/10 p-2 rounded text-sm">
                      <div className="font-medium">{booking.title}</div>
                      <div className="text-xs">
                        {booking.startTime} - {booking.endTime}
                      </div>
                      <div className="text-xs">
                        {classrooms.find(c => c.id === booking.roomId)?.name}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Нет занятий
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
  
  // Render month view
  const renderMonthView = () => {
    const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
    const firstDayOfMonth = startOfMonth(currentDate);
    const firstDayOfWeek = firstDayOfMonth.getDay() || 7;
    
    // Add empty days to align first day of month
    const emptyDays = Array.from({ length: firstDayOfWeek - 1 }, (_, i) => i);
    
    return (
      <Calendar
        mode="single"
        selected={currentDate}
        onSelect={(date) => date && setCurrentDate(date)}
        className="w-full"
        disabled={{ before: new Date(2020, 0, 1) }}
        modifiers={{
          booked: days.filter(day => {
            const dayFormatted = formatDate(day);
            return filteredBookings.some(b => b.date === dayFormatted);
          }),
        }}
        modifiersClassNames={{
          booked: 'bg-profit-blue/20',
        }}
        footer={
          <div className="mt-4">
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm">События на {formatDisplayDate(currentDate)}</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const dayBookings = filteredBookings.filter(b => b.date === formatDate(currentDate));
                  return dayBookings.length > 0 ? (
                    <div className="space-y-2">
                      {dayBookings.map(booking => (
                        <div key={booking.id} className="bg-profit-blue/10 p-2 rounded text-sm">
                          <div className="font-medium">{booking.title}</div>
                          <div className="text-xs">
                            {booking.startTime} - {booking.endTime}
                          </div>
                          <div className="text-xs">
                            {classrooms.find(c => c.id === booking.roomId)?.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-2">
                      Нет событий на выбранную дату
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        }
      />
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-profit-dark">Расписание кабинетов</h1>
        
        <div className="flex items-center gap-2">
          <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Выберите кабинет" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все кабинеты</SelectItem>
              {classrooms.map(classroom => (
                <SelectItem key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader className="bg-profit-blue/10 flex flex-row justify-between items-center">
          <CardTitle className="text-xl text-profit-dark flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            <span>{dateRange.title}</span>
          </CardTitle>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setViewMode('day')}>
                День
              </Button>
              <Button variant="outline" size="sm" onClick={() => setViewMode('week')}>
                Неделя
              </Button>
              <Button variant="outline" size="sm" onClick={() => setViewMode('month')}>
                Месяц
              </Button>
            </div>
            
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={() => navigateDate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Сегодня
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateDate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <div className="p-4">
            {viewMode === 'day' && renderDayView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'month' && renderMonthView()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Schedule;
