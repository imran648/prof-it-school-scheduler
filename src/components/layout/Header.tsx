
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Header = () => {
  const { teachers, selectedTeacherId, setSelectedTeacherId } = useApp();
  
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-profit-blue to-profit-orange bg-clip-text text-transparent">
            Prof-it
          </span>
        </Link>
        <span className="text-sm text-gray-500">Система управления IT школой</span>
      </div>
      
      <div className="w-64">
        <Select 
          value={selectedTeacherId} 
          onValueChange={(value) => setSelectedTeacherId(value)}
        >
          <SelectTrigger className="w-full">
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
    </header>
  );
};

export default Header;
