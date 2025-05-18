import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Group, Student } from '@/types';
import { PlusIcon, UsersIcon, TrashIcon } from 'lucide-react';
import GroupDetail from '@/components/GroupDetail';

const Groups = () => {
  const { 
    groups, teachers, classrooms, addGroup, getGroupStudents, 
    addStudent, removeStudent, deleteGroup, generatePaymentPeriods
  } = useApp();
  
  const [newGroup, setNewGroup] = useState({
    name: '',
    teacherId: '',
    startDate: '',
    endDate: '',
    totalLessons: 32,
    paymentPeriod: 8, // Default payment period of 8 lessons
  });
  
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [newStudent, setNewStudent] = useState({
    name: '',
    contacts: '',
    groupId: '',
  });
  
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isGroupDetailOpen, setIsGroupDetailOpen] = useState(false);
  
  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    
    addGroup({
      ...newGroup,
      schedule: [],
      completedLessons: 0,
      students: [],
      lastPaymentDate: new Date().toISOString().split('T')[0],
      paymentPeriod: newGroup.paymentPeriod,
    });
    
    setNewGroup({
      name: '',
      teacherId: '',
      startDate: '',
      endDate: '',
      totalLessons: 32,
      paymentPeriod: 8,
    });
    
    setIsAddGroupOpen(false);
  };
  
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    
    addStudent({
      ...newStudent,
      groupId: selectedGroupId,
    });
    
    setNewStudent({
      name: '',
      contacts: '',
      groupId: '',
    });
    
    setIsAddStudentOpen(false);
  };
  
  const handleDeleteGroup = (groupId: string) => {
    deleteGroup(groupId);
    if (selectedGroupId === groupId) {
      setSelectedGroupId('');
      setIsGroupDetailOpen(false);
    }
  };
  
  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const selectedGroupStudents = selectedGroup ? getGroupStudents(selectedGroup.id) : [];
  
  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Неизвестный преподаватель';
  };
  
  const calculateProgress = (completed: number, total: number) => {
    return (completed / total) * 100;
  };

  const openGroupDetail = (groupId: string) => {
    setSelectedGroupId(groupId);
    setIsGroupDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-profit-dark">Группы обучения</h1>
        
        <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
          <DialogTrigger asChild>
            <Button className="bg-profit-blue hover:bg-profit-blue/80">
              <PlusIcon className="mr-2 h-4 w-4" /> Добавить группу
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Новая группа</DialogTitle>
              <DialogDescription>
                Создайте новую учебную группу. Заполните необходимые данные.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddGroup} className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="groupName">Название группы</Label>
                  <Input 
                    id="groupName" 
                    value={newGroup.name} 
                    onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="teacherId">Преподаватель</Label>
                  <Select 
                    value={newGroup.teacherId} 
                    onValueChange={(value) => setNewGroup({...newGroup, teacherId: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите преподавателя" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name} ({teacher.subject})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Дата начала</Label>
                    <Input 
                      id="startDate" 
                      type="date" 
                      value={newGroup.startDate} 
                      onChange={(e) => setNewGroup({...newGroup, startDate: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">Дата окончания</Label>
                    <Input 
                      id="endDate" 
                      type="date" 
                      value={newGroup.endDate} 
                      onChange={(e) => setNewGroup({...newGroup, endDate: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="totalLessons">Всего занятий</Label>
                  <Input 
                    id="totalLessons" 
                    type="number" 
                    min="1" 
                    value={newGroup.totalLessons} 
                    onChange={(e) => setNewGroup({...newGroup, totalLessons: Number(e.target.value)})}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="paymentPeriod">Количество занятий между оплатами</Label>
                  <Input 
                    id="paymentPeriod" 
                    type="number" 
                    min="1" 
                    value={newGroup.paymentPeriod} 
                    onChange={(e) => setNewGroup({...newGroup, paymentPeriod: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit">Создать группу</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-profit-blue to-profit-blue/70 text-white">
              <CardTitle className="flex justify-between">
                <span>{group.name}</span>
                <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                  {group.completedLessons} / {group.totalLessons} занятий
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Преподаватель</p>
                  <p className="font-medium">{getTeacherName(group.teacherId)}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Начало обучения</p>
                    <p className="font-medium">{new Date(group.startDate).toLocaleDateString('ru-RU')}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Окончание</p>
                    <p className="font-medium">{new Date(group.endDate).toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Прогресс</p>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                    <div 
                      className="h-full bg-profit-green rounded-full" 
                      style={{ width: `${calculateProgress(group.completedLessons, group.totalLessons)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Студенты ({getGroupStudents(group.id).length})</p>
                    
                    <Dialog open={isAddStudentOpen && selectedGroupId === group.id} onOpenChange={(open) => {
                      if (open) {
                        setSelectedGroupId(group.id);
                      }
                      setIsAddStudentOpen(open);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedGroupId(group.id)}>
                          <PlusIcon className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Добавить студента</DialogTitle>
                          <DialogDescription>
                            Добавление нового студента в группу {group.name}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={handleAddStudent} className="space-y-4 pt-4">
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="studentName">ФИО студента</Label>
                              <Input 
                                id="studentName" 
                                value={newStudent.name} 
                                onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                                required
                              />
                            </div>
                            
                            <div className="grid gap-2">
                              <Label htmlFor="contacts">Контактные данные</Label>
                              <Input 
                                id="contacts" 
                                value={newStudent.contacts} 
                                onChange={(e) => setNewStudent({...newStudent, contacts: e.target.value})}
                                required
                              />
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button type="submit">Добавить</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {getGroupStudents(group.id).length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {getGroupStudents(group.id).slice(0, 3).map((student) => (
                        <li key={student.id} className="text-sm bg-gray-100 p-2 rounded flex justify-between">
                          <span>{student.name}</span>
                          <span className="text-gray-500 text-xs">{student.contacts}</span>
                        </li>
                      ))}
                      {getGroupStudents(group.id).length > 3 && (
                        <li className="text-center text-sm text-gray-500">
                          и еще {getGroupStudents(group.id).length - 3} студентов...
                        </li>
                      )}
                    </ul>
                  ) : (
                    <div className="flex justify-center items-center h-20 bg-gray-100 rounded-lg mt-2">
                      <p className="text-gray-500 text-sm">Нет студентов в группе</p>
                    </div>
                  )}
                </div>
                
                <div className="pt-2 flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => openGroupDetail(group.id)}
                  >
                    <UsersIcon className="mr-2 h-4 w-4" /> Просмотр группы
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <TrashIcon className="mr-2 h-4 w-4" /> Удалить ��руппу
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Удаление группы</AlertDialogTitle>
                        <AlertDialogDescription>
                          Вы уверены, что хотите удалить группу "{group.name}"? 
                          Это действие нельзя отменить. Все данные группы, включая 
                          записи о студентах, посещаемости и оплатах, будут удалены.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => handleDeleteGroup(group.id)}
                        >
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                    onClick={() => generatePaymentPeriods(group.id)}
                  >
                    <UsersIcon className="mr-2 h-4 w-4" /> Сгенерировать периоды оплаты
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {groups.length === 0 && (
        <Card className="p-10 text-center">
          <div className="flex flex-col items-center justify-center text-gray-500">
            <UsersIcon className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-medium mb-1">Нет учебных групп</h3>
            <p className="mb-4">Создайте вашу первую учебную группу</p>
            <Button onClick={() => setIsAddGroupOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" /> Добавить группу
            </Button>
          </div>
        </Card>
      )}
      
      {isGroupDetailOpen && selectedGroupId && (
        <GroupDetail 
          groupId={selectedGroupId} 
          onClose={() => {
            setIsGroupDetailOpen(false);
            setSelectedGroupId('');
          }} 
        />
      )}
    </div>
  );
};

export default Groups;
