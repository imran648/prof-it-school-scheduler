
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
import { PlusIcon, LayoutIcon, Pencil, Trash2, Calendar } from 'lucide-react';
import { ClassRoom } from '@/types';
import { useNavigate } from 'react-router-dom';

const ClassRooms = () => {
  const { classrooms, addClassroom, updateClassroom, deleteClassroom } = useApp();
  const navigate = useNavigate();
  const [isAddClassroomOpen, setIsAddClassroomOpen] = useState(false);
  const [isEditClassroomOpen, setIsEditClassroomOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<ClassRoom | null>(null);
  const [newClassroom, setNewClassroom] = useState({
    name: '',
    capacity: 15,
    location: '',
    equipment: []
  });

  const handleAddClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    addClassroom(newClassroom);
    setNewClassroom({
      name: '',
      capacity: 15,
      location: '',
      equipment: []
    });
    setIsAddClassroomOpen(false);
  };

  const handleEditClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClassroom) {
      updateClassroom(selectedClassroom);
      setIsEditClassroomOpen(false);
      setSelectedClassroom(null);
    }
  };

  const handleDeleteClassroom = () => {
    if (selectedClassroom) {
      deleteClassroom(selectedClassroom.id);
      setIsDeleteDialogOpen(false);
      setSelectedClassroom(null);
    }
  };

  const openEditDialog = (classroom: ClassRoom) => {
    setSelectedClassroom(classroom);
    setIsEditClassroomOpen(true);
  };

  const openDeleteDialog = (classroom: ClassRoom) => {
    setSelectedClassroom(classroom);
    setIsDeleteDialogOpen(true);
  };

  const viewClassroomSchedule = (roomId: string) => {
    navigate('/', { state: { roomId } });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-profit-dark">Кабинеты</h1>
        
        <Dialog open={isAddClassroomOpen} onOpenChange={setIsAddClassroomOpen}>
          <DialogTrigger asChild>
            <Button className="bg-profit-blue hover:bg-profit-blue/80">
              <PlusIcon className="mr-2 h-4 w-4" /> Добавить кабинет
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Новый кабинет</DialogTitle>
              <DialogDescription>
                Добавьте новый учебный кабинет в систему.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddClassroom} className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="roomName">Название кабинета</Label>
                  <Input 
                    id="roomName" 
                    value={newClassroom.name} 
                    onChange={(e) => setNewClassroom({...newClassroom, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="capacity">Вместимость (чел.)</Label>
                  <Input 
                    id="capacity" 
                    type="number"
                    min="1"
                    value={newClassroom.capacity} 
                    onChange={(e) => setNewClassroom({...newClassroom, capacity: Number(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="location">Расположение</Label>
                  <Input 
                    id="location" 
                    value={newClassroom.location} 
                    onChange={(e) => setNewClassroom({...newClassroom, location: e.target.value})}
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
        {classrooms.map((classroom) => (
          <Card key={classroom.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-profit-orange to-profit-orange/70 text-white">
              <CardTitle className="flex justify-between items-center">
                <span>{classroom.name}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(classroom)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(classroom)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Вместимость</p>
                  <p className="font-medium">{classroom.capacity} человек</p>
                </div>
                
                {classroom.location && (
                  <div>
                    <p className="text-sm text-gray-500">Расположение</p>
                    <p className="font-medium">{classroom.location}</p>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => viewClassroomSchedule(classroom.id)}
                  >
                    <Calendar className="mr-2 h-4 w-4" /> 
                    Расписание кабинета
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {classrooms.length === 0 && (
        <Card className="p-10 text-center">
          <div className="flex flex-col items-center justify-center text-gray-500">
            <LayoutIcon className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-medium mb-1">Нет учебных кабинетов</h3>
            <p className="mb-4">Добавьте ваш первый учебный кабинет</p>
            <Button onClick={() => setIsAddClassroomOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" /> Добавить кабинет
            </Button>
          </div>
        </Card>
      )}
      
      {/* Edit Classroom Dialog */}
      <Dialog open={isEditClassroomOpen && !!selectedClassroom} onOpenChange={(open) => {
        if (!open) setSelectedClassroom(null);
        setIsEditClassroomOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактировать кабинет</DialogTitle>
            <DialogDescription>
              Обновите информацию о кабинете.
            </DialogDescription>
          </DialogHeader>
          
          {selectedClassroom && (
            <form onSubmit={handleEditClassroom} className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editName">Название кабинета</Label>
                  <Input 
                    id="editName" 
                    value={selectedClassroom.name} 
                    onChange={(e) => setSelectedClassroom({...selectedClassroom, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="editCapacity">Вместимость (чел.)</Label>
                  <Input 
                    id="editCapacity" 
                    type="number"
                    min="1"
                    value={selectedClassroom.capacity} 
                    onChange={(e) => setSelectedClassroom({...selectedClassroom, capacity: Number(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="editLocation">Расположение</Label>
                  <Input 
                    id="editLocation" 
                    value={selectedClassroom.location || ''} 
                    onChange={(e) => setSelectedClassroom({...selectedClassroom, location: e.target.value})}
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
      
      {/* Delete Classroom Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Удалить кабинет</DialogTitle>
            <DialogDescription>
              {selectedClassroom && `Вы уверены, что хотите удалить кабинет ${selectedClassroom.name}?`}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteClassroom}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassRooms;
