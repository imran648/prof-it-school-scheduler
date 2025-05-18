
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { PlusIcon, UserIcon, Pencil, Trash2 } from 'lucide-react';
import { Teacher } from '@/types';

const Teachers = () => {
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useApp();
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    subject: '',
    email: '',
    phone: '',
    groups: [] as string[]
  });

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    addTeacher(newTeacher);
    setNewTeacher({
      name: '',
      subject: '',
      email: '',
      phone: '',
      groups: []
    });
    setIsAddTeacherOpen(false);
  };

  const handleEditTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTeacher) {
      updateTeacher(selectedTeacher);
      setIsEditTeacherOpen(false);
      setSelectedTeacher(null);
    }
  };

  const handleDeleteTeacher = () => {
    if (selectedTeacher) {
      deleteTeacher(selectedTeacher.id);
      setIsDeleteDialogOpen(false);
      setSelectedTeacher(null);
    }
  };

  const openEditDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsEditTeacherOpen(true);
  };

  const openDeleteDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-profit-dark">Преподаватели</h1>
        
        <Dialog open={isAddTeacherOpen} onOpenChange={setIsAddTeacherOpen}>
          <DialogTrigger asChild>
            <Button className="bg-profit-blue hover:bg-profit-blue/80">
              <PlusIcon className="mr-2 h-4 w-4" /> Добавить преподавателя
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Новый преподаватель</DialogTitle>
              <DialogDescription>
                Добавьте нового преподавателя в систему.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddTeacher} className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="teacherName">ФИО преподавателя</Label>
                  <Input 
                    id="teacherName" 
                    value={newTeacher.name} 
                    onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="subject">Предмет</Label>
                  <Input 
                    id="subject" 
                    value={newTeacher.subject} 
                    onChange={(e) => setNewTeacher({...newTeacher, subject: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={newTeacher.email} 
                    onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input 
                    id="phone" 
                    value={newTeacher.phone} 
                    onChange={(e) => setNewTeacher({...newTeacher, phone: e.target.value})}
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <Card key={teacher.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-profit-blue to-profit-blue/70 text-white">
              <CardTitle className="flex justify-between items-center">
                <span>{teacher.name}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(teacher)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(teacher)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Предмет</p>
                  <p className="font-medium">{teacher.subject}</p>
                </div>
                
                {teacher.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{teacher.email}</p>
                  </div>
                )}
                
                {teacher.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Телефон</p>
                    <p className="font-medium">{teacher.phone}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-500">Группы</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {teacher.groups.length > 0 ? (
                      teacher.groups.map((groupId, index) => (
                        <span key={index} className="bg-profit-blue/10 text-profit-blue text-xs px-2 py-1 rounded-full">
                          {groupId}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">Нет групп</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {teachers.length === 0 && (
        <Card className="p-10 text-center">
          <div className="flex flex-col items-center justify-center text-gray-500">
            <UserIcon className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-medium mb-1">Нет преподавателей</h3>
            <p className="mb-4">Добавьте вашего первого преподавателя</p>
            <Button onClick={() => setIsAddTeacherOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" /> Добавить преподавателя
            </Button>
          </div>
        </Card>
      )}
      
      {/* Edit Teacher Dialog */}
      <Dialog open={isEditTeacherOpen && !!selectedTeacher} onOpenChange={(open) => {
        if (!open) setSelectedTeacher(null);
        setIsEditTeacherOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактировать преподавателя</DialogTitle>
            <DialogDescription>
              Обновите информацию о преподавателе.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTeacher && (
            <form onSubmit={handleEditTeacher} className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editName">ФИО преподавателя</Label>
                  <Input 
                    id="editName" 
                    value={selectedTeacher.name} 
                    onChange={(e) => setSelectedTeacher({...selectedTeacher, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="editSubject">Предмет</Label>
                  <Input 
                    id="editSubject" 
                    value={selectedTeacher.subject} 
                    onChange={(e) => setSelectedTeacher({...selectedTeacher, subject: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="editEmail">Email</Label>
                  <Input 
                    id="editEmail" 
                    type="email"
                    value={selectedTeacher.email || ''} 
                    onChange={(e) => setSelectedTeacher({...selectedTeacher, email: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="editPhone">Телефон</Label>
                  <Input 
                    id="editPhone" 
                    value={selectedTeacher.phone || ''} 
                    onChange={(e) => setSelectedTeacher({...selectedTeacher, phone: e.target.value})}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit">Сохранить</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Teacher Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Удалить преподавателя</DialogTitle>
            <DialogDescription>
              {selectedTeacher && `Вы уверены, что хотите удалить преподавателя ${selectedTeacher.name}?`}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteTeacher}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Teachers;
