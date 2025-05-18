
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Group, Student, Attendance, ClassSession } from '@/types';
import { CalendarIcon, UsersIcon, BookIcon, ClockIcon } from 'lucide-react';

interface GroupDetailProps {
  groupId: string;
  onClose: () => void;
}

const GroupDetail = ({ groupId, onClose }: GroupDetailProps) => {
  const { groups, teachers, classrooms, getGroupStudents, bookings, attendanceRecords } = useApp();
  const [activeTab, setActiveTab] = useState('info');
  
  const group = groups.find(g => g.id === groupId);
  if (!group) return null;
  
  const students = getGroupStudents(groupId);
  const teacher = teachers.find(t => t.id === group.teacherId);
  const groupAttendance = attendanceRecords.filter(record => record.groupId === groupId);
  
  // Calculate attendance statistics
  const attendanceStats = {
    total: groupAttendance.length,
    present: groupAttendance.reduce((acc, record) => acc + record.presentStudents.length, 0),
    absent: groupAttendance.reduce((acc, record) => acc + record.absentStudents.length, 0)
  };
  
  const groupProgress = Math.floor((group.completedLessons / group.totalLessons) * 100);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };
  
  // Get classroom name
  const getClassroomName = (roomId: string) => {
    const classroom = classrooms.find(room => room.id === roomId);
    return classroom ? classroom.name : 'Неизвестный кабинет';
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{group.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="info">Информация</TabsTrigger>
            <TabsTrigger value="schedule">Расписание</TabsTrigger>
            <TabsTrigger value="students">Студенты</TabsTrigger>
            <TabsTrigger value="attendance">Посещаемость</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  <span>Основная информация</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Преподаватель</p>
                  <p className="font-medium">{teacher?.name || 'Не назначен'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Предмет</p>
                  <p className="font-medium">{teacher?.subject || 'Не указан'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Дата начала</p>
                  <p className="font-medium">{formatDate(group.startDate)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Дата окончания</p>
                  <p className="font-medium">{formatDate(group.endDate)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Всего занятий</p>
                  <p className="font-medium">{group.totalLessons}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Пройдено занятий</p>
                  <p className="font-medium">{group.completedLessons}</p>
                </div>
                
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-2">Прогресс обучения</p>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-profit-blue rounded-full" 
                      style={{ width: `${groupProgress}%` }}
                    />
                  </div>
                  <p className="text-right text-sm mt-1">{groupProgress}%</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClockIcon className="mr-2 h-5 w-5" />
                  <span>Финансы</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Дата последней оплаты</p>
                  <p className="font-medium">{formatDate(group.lastPaymentDate)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Количество студентов</p>
                  <p className="font-medium">{students.length}</p>
                </div>
                
                <div className="md:col-span-2">
                  <Button variant="outline" className="w-full">Добавить оплату</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  <span>Расписание занятий</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {group.schedule.length > 0 ? (
                  <div className="space-y-4">
                    {group.schedule.map((session: ClassSession) => (
                      <div key={session.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{session.day}</p>
                            <p className="text-sm text-gray-500">
                              {session.startTime} - {session.endTime}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{getClassroomName(session.roomId)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Для этой группы не назначено расписание
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UsersIcon className="mr-2 h-5 w-5" />
                  <span>Студенты группы</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {students.length > 0 ? (
                  <div className="space-y-2">
                    {students.map((student: Student) => (
                      <div key={student.id} className="border rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.contacts}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Редактировать</Button>
                          <Button variant="destructive" size="sm">Удалить</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    В этой группе нет студентов
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookIcon className="mr-2 h-5 w-5" />
                  <span>История посещаемости</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {groupAttendance.length > 0 ? (
                  <>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-profit-blue/10 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Всего занятий</p>
                        <p className="text-2xl font-bold">{attendanceStats.total}</p>
                      </div>
                      <div className="bg-profit-green/10 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Присутствовали</p>
                        <p className="text-2xl font-bold">{attendanceStats.present}</p>
                      </div>
                      <div className="bg-profit-orange/10 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Отсутствовали</p>
                        <p className="text-2xl font-bold">{attendanceStats.absent}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {groupAttendance.map((record: Attendance) => (
                        <div key={record.sessionId} className="border rounded-lg p-3">
                          <p className="font-medium mb-2">{formatDate(record.date)}</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Присутствовали</p>
                              <div className="mt-1 space-y-1">
                                {record.presentStudents.map(studentId => {
                                  const student = students.find(s => s.id === studentId);
                                  return student ? (
                                    <p key={studentId} className="text-sm bg-profit-green/10 p-1 px-2 rounded">
                                      {student.name}
                                    </p>
                                  ) : null;
                                })}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Отсутствовали</p>
                              <div className="mt-1 space-y-1">
                                {record.absentStudents.map(studentId => {
                                  const student = students.find(s => s.id === studentId);
                                  return student ? (
                                    <p key={studentId} className="text-sm bg-profit-orange/10 p-1 px-2 rounded">
                                      {student.name}
                                    </p>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Нет данных о посещаемости для этой группы
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Закрыть</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupDetail;
