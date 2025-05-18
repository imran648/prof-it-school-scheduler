
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Payment, PaymentStatus, Student } from '@/types';
import { CheckIcon, DollarSignIcon, CalendarCheckIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const Finances = () => {
  const { 
    groups, students, payments, updatePaymentStatus, 
    getGroupStudents, getStudentPayments, getGroupPayments, generatePaymentPeriods
  } = useApp();
  
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<string>('pending');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [groupStudents, setGroupStudents] = useState<Student[]>([]);
  
  const { toast } = useToast();
  
  // Загрузка студентов при выборе группы
  useEffect(() => {
    if (selectedGroupId) {
      const students = getGroupStudents(selectedGroupId);
      setGroupStudents(students);
      
      // Сбрасываем выбранного студента при смене группы
      setSelectedStudentId('all');
    } else {
      setGroupStudents([]);
    }
  }, [selectedGroupId]);
  
  // Фильтрация платежей по выбранной группе, студенту и статусу
  useEffect(() => {
    if (selectedGroupId) {
      let filtered = getGroupPayments(selectedGroupId);
      
      // Фильтруем по студенту, если выбран конкретный
      if (selectedStudentId !== 'all') {
        filtered = filtered.filter(payment => payment.studentId === selectedStudentId);
      }
      
      // Фильтруем по статусу
      if (selectedTab !== 'all') {
        filtered = filtered.filter(payment => payment.status === selectedTab);
      }
      
      setFilteredPayments(filtered);
    } else {
      setFilteredPayments([]);
    }
  }, [selectedGroupId, selectedStudentId, selectedTab, payments]);
  
  const handlePaymentStatusUpdate = (paymentId: string, status: PaymentStatus) => {
    updatePaymentStatus(paymentId, status);
  };
  
  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status: PaymentStatus) => {
    switch (status) {
      case 'confirmed': return 'Оплачено';
      case 'pending': return 'Ожидается';
      case 'overdue': return 'Просрочено';
      default: return 'Неизвестно';
    }
  };
  
  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Неизвестный студент';
  };
  
  const generateAllPaymentPeriods = () => {
    groups.forEach(group => {
      generatePaymentPeriods(group.id);
    });
    
    toast({
      title: "Периоды оплаты сгенерированы",
      description: "Периоды оплаты для всех групп успешно сгенерированы."
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-profit-dark">Финансы</h1>
        
        <Button onClick={generateAllPaymentPeriods}>
          <DollarSignIcon className="mr-2 h-4 w-4" />
          Сгенерировать все периоды оплаты
        </Button>
      </div>
      
      <Card>
        <CardHeader className="bg-profit-blue/10">
          <CardTitle>Управление оплатами</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Выберите группу
              </label>
              <Select 
                value={selectedGroupId} 
                onValueChange={setSelectedGroupId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите группу" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name} ({getGroupStudents(group.id).length} студентов)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedGroupId && (
              <>
                {/* Добавляем выбор студента если группа выбрана */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Студент
                  </label>
                  <Select 
                    value={selectedStudentId} 
                    onValueChange={setSelectedStudentId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите студента" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все студенты</SelectItem>
                      {groupStudents.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              
                <Tabs defaultValue="pending" onValueChange={setSelectedTab}>
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="pending">Ожидают оплаты</TabsTrigger>
                    <TabsTrigger value="confirmed">Оплаченные</TabsTrigger>
                    <TabsTrigger value="overdue">Просроченные</TabsTrigger>
                    <TabsTrigger value="all">Все</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={selectedTab} className="mt-0">
                    {filteredPayments.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-2 text-left">Студент</th>
                              <th className="px-4 py-2 text-left">Период</th>
                              <th className="px-4 py-2 text-left">Сумма</th>
                              <th className="px-4 py-2 text-center">Статус</th>
                              <th className="px-4 py-2 text-center">Действия</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPayments.map((payment) => (
                              <tr key={payment.id} className="border-t">
                                <td className="px-4 py-3">
                                  {getStudentName(payment.studentId)}
                                </td>
                                <td className="px-4 py-3">
                                  {payment.period}
                                </td>
                                <td className="px-4 py-3">
                                  {payment.amount.toLocaleString()} ₽
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <Badge className={getStatusColor(payment.status)}>
                                    {getStatusText(payment.status)}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="flex justify-center space-x-2">
                                    {payment.status !== 'confirmed' && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                                        onClick={() => handlePaymentStatusUpdate(payment.id, 'confirmed')}
                                      >
                                        <CheckIcon className="w-4 h-4 mr-1" /> Подтвердить
                                      </Button>
                                    )}
                                    {payment.status === 'confirmed' && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
                                        onClick={() => handlePaymentStatusUpdate(payment.id, 'pending')}
                                      >
                                        <CalendarCheckIcon className="w-4 h-4 mr-1" /> Отменить
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
                        <DollarSignIcon className="w-12 h-12 mb-2 text-gray-400" />
                        <p>Нет платежей в выбранной категории</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
            
            {!selectedGroupId && (
              <div className="flex flex-col items-center justify-center p-10 text-center text-gray-500">
                <DollarSignIcon className="w-12 h-12 mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">Выберите группу для просмотра финансов</p>
                <p>После выбора группы вы увидите информацию о платежах студентов</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Finances;
