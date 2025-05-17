
import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Group, Student } from '@/types';
import { PlusIcon, CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherJournal = () => {
  const { selectedTeacherId, teachers, groups, getTeacherGroups } = useApp();
  const [teacherGroups, setTeacherGroups] = useState<Group[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (selectedTeacherId) {
      setTeacherGroups(getTeacherGroups(selectedTeacherId));
    } else {
      setTeacherGroups([]);
    }
  }, [selectedTeacherId, groups]);
  
  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
  
  // Get today's date and day of week
  const today = new Date();
  const currentDay = today.toLocaleDateString('ru-RU', { weekday: 'long' });
  const formattedDate = today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  
  // Filter today's classes
  const todaysClasses = teacherGroups.filter(group => 
    group.schedule.some(session => session.day === currentDay)
  );
  
  if (!selectedTeacherId) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Card className="w-full max-w-md p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Журнал преподавателя</h2>
          <p className="text-gray-500 mb-6">Пожалуйста, выберите преподавателя в выпадающем меню в верхней части страницы.</p>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-profit-dark">
            Журнал преподавателя
          </h1>
          {selectedTeacher && (
            <p className="text-gray-500">
              {selectedTeacher.name} · {selectedTeacher.subject}
            </p>
          )}
        </div>
        
        <Button 
          className="bg-profit-blue hover:bg-profit-blue/80"
          onClick={() => navigate('/groups')}
        >
          <PlusIcon className="mr-2 h-4 w-4" /> Добавить группу
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="bg-profit-blue/10">
            <CardTitle>Мои группы</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {teacherGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
                <p className="mb-4">У вас пока нет групп.</p>
                <Button onClick={() => navigate('/groups')}>
                  <PlusIcon className="mr-2 h-4 w-4" /> Добавить группу
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Все группы</TabsTrigger>
                  <TabsTrigger value="active">Активные</TabsTrigger>
                  <TabsTrigger value="completed">Завершенные</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  {teacherGroups.map((group) => (
                    <div key={group.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{group.name}</h3>
                          <div className="text-sm text-gray-500">
                            {group.schedule.map(session => (
                              <span key={session.id} className="mr-4">
                                {session.day}: {session.startTime} - {session.endTime}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {group.completedLessons} из {group.totalLessons} занятий
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(group.startDate).toLocaleDateString('ru-RU')} - {new Date(group.endDate).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="active" className="space-y-4">
                  {teacherGroups
                    .filter(group => new Date(group.endDate) >= new Date())
                    .map((group) => (
                      <div key={group.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{group.name}</h3>
                            <div className="text-sm text-gray-500">
                              {group.schedule.map(session => (
                                <span key={session.id} className="mr-4">
                                  {session.day}: {session.startTime} - {session.endTime}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {group.completedLessons} из {group.totalLessons} занятий
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(group.startDate).toLocaleDateString('ru-RU')} - {new Date(group.endDate).toLocaleDateString('ru-RU')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </TabsContent>
                
                <TabsContent value="completed" className="space-y-4">
                  {teacherGroups
                    .filter(group => new Date(group.endDate) < new Date())
                    .map((group) => (
                      <div key={group.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{group.name}</h3>
                            <div className="text-sm text-gray-500">
                              {group.schedule.map(session => (
                                <span key={session.id} className="mr-4">
                                  {session.day}: {session.startTime} - {session.endTime}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {group.completedLessons} из {group.totalLessons} занятий
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(group.startDate).toLocaleDateString('ru-RU')} - {new Date(group.endDate).toLocaleDateString('ru-RU')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-profit-orange/10">
            <CardTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              <span>Сегодня, {formattedDate}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {todaysClasses.length > 0 ? (
              <div className="space-y-4">
                {todaysClasses.map(group => (
                  <div key={group.id} className="border rounded-lg p-4 bg-profit-light">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{group.name}</h3>
                        <div className="text-sm text-gray-500">
                          {group.schedule
                            .filter(session => session.day === currentDay)
                            .map(session => (
                              <span key={session.id}>
                                {session.startTime} - {session.endTime}
                              </span>
                            ))}
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm" onClick={() => navigate('/attendance')}>
                        Отметить посещаемость
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
                <p>Сегодня у вас нет занятий</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherJournal;
