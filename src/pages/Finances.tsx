
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Payment, PaymentStatus, Student, Group } from '@/types';
import { CheckIcon, DollarSignIcon, CalendarCheckIcon, PlusIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { format, addMonths, parseISO } from 'date-fns';

const Finances = () => {
  const { 
    groups, students, payments, updatePaymentStatus, addPayment,
    getGroupStudents, getStudentPayments, getGroupPayments, generatePaymentPeriods
  } = useApp();
  
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<string>('pending');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [groupStudents, setGroupStudents] = useState<Student[]>([]);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    studentId: '',
    amount: 10000,
    period: '',
    lessonStart: 1,
    lessonEnd: 8,
    month: format(new Date(), 'yyyy-MM'),
  });
  
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
  
  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedGroup = groups.find(g => g.id === selectedGroupId);
    if (!selectedGroup) return;
    
    // Формирование информации о периоде в зависимости от типа оплаты
    let period = '';
    let paymentData: Omit<Payment, 'id'> = {
      studentId: newPayment.studentId,
      amount: newPayment.amount,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      period: ''
    };
    
    if (selectedGroup.paymentType === 'perLesson') {
      period = `Занятия ${newPayment.lessonStart}-${newPayment.lessonEnd}`;
      paymentData = {
        ...paymentData,
        period,
        lessonStart: newPayment.lessonStart,
        lessonEnd: newPayment.lessonEnd,
      };
    } else { // 'monthly'
      const monthName = format(new Date(newPayment.month), 'MMMM yyyy');
      period = `${monthName}`;
      paymentData = {
        ...paymentData,
        period,
        month: newPayment.month,
      };
    }
    
    addPayment(paymentData);
    
    setIsAddPaymentOpen(false);
    toast({
      title: "Платеж добавлен",
      description: `Платеж за ${period} успешно создан`,
    });
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
  
  const resetNewPayment = (selectedGroup: Group | undefined, studentId: string = '') => {
    const defaultEndLesson = selectedGroup?.paymentPeriod || 8;
    
    setNewPayment({
      studentId: studentId,
      amount: selectedGroup?.paymentType === 'monthly' ? (selectedGroup?.monthlyFee || 10000) : 10000,
      period: '',
      lessonStart: 1,
      lessonEnd: defaultEndLesson,
      month: format(new Date(), 'yyyy-MM'),
    });
  };
  
  const handleOpenAddPayment = (studentId: string) => {
    const selectedGroup = groups.find(g => g.id === selectedGroupId);
    resetNewPayment(selectedGroup, studentId);
    setIsAddPaymentOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-profit-dark">Финансы</h1>
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
                <Tabs defaultValue="students" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="students">По студентам</TabsTrigger>
                    <TabsTrigger value="payments">Все платежи</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="students">
                    <div className="space-y-4">
                      {groupStudents.length > 0 ? (
                        groupStudents.map(student => {
                          const studentPayments = getStudentPayments(student.id);
                          const selectedGroup = groups.find(g => g.id === selectedGroupId);
                          
                          return (
                            <Card key={student.id} className="overflow-hidden">
                              <CardHeader className="bg-gray-50 py-3">
                                <div className="flex justify-between items-center">
                                  <h3 className="font-medium">{student.name}</h3>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleOpenAddPayment(student.id)}
                                  >
                                    <PlusIcon className="h-4 w-4 mr-1" /> Добавить платёж
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-3 pb-0">
                                {studentPayments.length > 0 ? (
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left py-2 px-1">Период</th>
                                        <th className="text-left py-2 px-1">Сумма</th>
                                        <th className="text-center py-2 px-1">Статус</th>
                                        <th className="text-center py-2 px-1">Действия</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {studentPayments.map(payment => (
                                        <tr key={payment.id} className="border-b">
                                          <td className="py-2 px-1">{payment.period}</td>
                                          <td className="py-2 px-1">{payment.amount.toLocaleString()} ₽</td>
                                          <td className="py-2 px-1 text-center">
                                            <Badge className={getStatusColor(payment.status)}>
                                              {getStatusText(payment.status)}
                                            </Badge>
                                          </td>
                                          <td className="py-2 px-1 text-center">
                                            <div className="flex justify-center space-x-1">
                                              {payment.status !== 'confirmed' && (
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                                                  onClick={() => handlePaymentStatusUpdate(payment.id, 'confirmed')}
                                                >
                                                  <CheckIcon className="w-3 h-3 mr-1" /> Оплачено
                                                </Button>
                                              )}
                                              {payment.status === 'confirmed' && (
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
                                                  onClick={() => handlePaymentStatusUpdate(payment.id, 'pending')}
                                                >
                                                  <CalendarCheckIcon className="w-3 h-3 mr-1" /> Отменить
                                                </Button>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <div className="flex flex-col items-center justify-center p-4 text-center text-gray-500">
                                    <p>Нет платежей для этого студента</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
                          <DollarSignIcon className="w-12 h-12 mb-2 text-gray-400" />
                          <p>В этой группе нет студентов</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="payments">
                    <div className="space-y-4">
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
                    </div>
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
      
      {/* Диалог добавления платежа */}
      <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Добавить платеж</DialogTitle>
            <DialogDescription>
              Создайте новый платеж для студента
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddPayment} className="space-y-4 pt-4">
            <div className="grid gap-4">
              {!newPayment.studentId && (
                <div className="grid gap-2">
                  <Label htmlFor="studentId">Студент</Label>
                  <Select 
                    value={newPayment.studentId} 
                    onValueChange={(value) => setNewPayment({...newPayment, studentId: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите студента" />
                    </SelectTrigger>
                    <SelectContent>
                      {groupStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="amount">Сумма (₽)</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  min="1" 
                  value={newPayment.amount} 
                  onChange={(e) => setNewPayment({...newPayment, amount: Number(e.target.value)})}
                  required
                />
              </div>
              
              {/* Период оплаты в зависимости от типа группы */}
              {selectedGroupId && groups.find(g => g.id === selectedGroupId)?.paymentType === 'perLesson' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="lessonStart">Занятие с</Label>
                    <Input 
                      id="lessonStart" 
                      type="number" 
                      min="1" 
                      value={newPayment.lessonStart} 
                      onChange={(e) => setNewPayment({...newPayment, lessonStart: Number(e.target.value)})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lessonEnd">Занятие по</Label>
                    <Input 
                      id="lessonEnd" 
                      type="number" 
                      min={newPayment.lessonStart} 
                      value={newPayment.lessonEnd} 
                      onChange={(e) => setNewPayment({...newPayment, lessonEnd: Number(e.target.value)})}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="month">Месяц оплаты</Label>
                  <Input 
                    id="month" 
                    type="month" 
                    value={newPayment.month} 
                    onChange={(e) => setNewPayment({...newPayment, month: e.target.value})}
                    required
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button type="submit">Создать платеж</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Finances;
