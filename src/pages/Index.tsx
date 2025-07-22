import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Property {
  id: number;
  address: string;
  status: 'protected' | 'unprotected' | 'emergency' | 'alarm';
  lastCheck: string;
}

const Index = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [alarmInterval, setAlarmInterval] = useState<NodeJS.Timeout | null>(null);

  // Инициализация 125 участков
  useEffect(() => {
    const initialProperties: Property[] = Array.from({ length: 125 }, (_, index) => ({
      id: index + 1,
      address: `ул. Охранная, д. ${index + 1}`,
      status: Math.random() > 0.7 ? 'protected' : 'unprotected',
      lastCheck: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toLocaleString('ru-RU')
    }));
    setProperties(initialProperties);
  }, []);

  // Автоматическое срабатывание сигнализации каждые 5 минут
  useEffect(() => {
    const interval = setInterval(() => {
      setProperties(prev => {
        const randomIndex = Math.floor(Math.random() * prev.length);
        const updated = [...prev];
        if (updated[randomIndex].status === 'protected') {
          updated[randomIndex].status = 'alarm';
          updated[randomIndex].lastCheck = new Date().toLocaleString('ru-RU');
        }
        return updated;
      });
    }, 5 * 60 * 1000); // 5 минут

    setAlarmInterval(interval);
    return () => clearInterval(interval);
  }, []);

  const handleProtectionToggle = (id: number) => {
    setProperties(prev => prev.map(prop => {
      if (prop.id === id) {
        return {
          ...prop,
          status: prop.status === 'protected' ? 'unprotected' : 'protected',
          lastCheck: new Date().toLocaleString('ru-RU')
        };
      }
      return prop;
    }));
    setSelectedProperty(null);
  };

  const handleEmergencyCall = (id: number) => {
    setProperties(prev => {
      const updated = prev.map(prop => 
        prop.id === id ? { ...prop, status: 'emergency' as const, lastCheck: new Date().toLocaleString('ru-RU') } : prop
      );
      // Переместить экстренный участок в начало списка
      const emergency = updated.find(p => p.id === id)!;
      const others = updated.filter(p => p.id !== id);
      return [emergency, ...others];
    });
    setSelectedProperty(null);
  };

  const triggerAlarm = (id: number) => {
    setProperties(prev => prev.map(prop => 
      prop.id === id ? { ...prop, status: 'alarm' as const, lastCheck: new Date().toLocaleString('ru-RU') } : prop
    ));
  };

  const clearAlarm = (id: number) => {
    setProperties(prev => prev.map(prop => 
      prop.id === id ? { ...prop, status: 'protected' as const, lastCheck: new Date().toLocaleString('ru-RU') } : prop
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'protected':
        return <Badge className="bg-green-600 text-white hover:bg-green-700">НА ОХРАНЕ</Badge>;
      case 'unprotected':
        return <Badge variant="outline" className="border-gray-400 text-gray-600">СНЯТО С ОХРАНЫ</Badge>;
      case 'emergency':
        return <Badge className="bg-red-600 text-white animate-pulse">ВЫЕЗД ГБР</Badge>;
      case 'alarm':
        return <Badge className="bg-orange-600 text-white animate-pulse">СИГНАЛИЗАЦИЯ</Badge>;
      default:
        return <Badge variant="outline">НЕИЗВЕСТНО</Badge>;
    }
  };

  const getPropertyCardClass = (status: string) => {
    switch (status) {
      case 'emergency':
        return 'border-red-600 bg-red-50 shadow-lg';
      case 'alarm':
        return 'border-orange-500 bg-orange-50 shadow-md';
      case 'protected':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-200';
    }
  };

  const stats = {
    total: properties.length,
    protected: properties.filter(p => p.status === 'protected').length,
    emergency: properties.filter(p => p.status === 'emergency').length,
    alarm: properties.filter(p => p.status === 'alarm').length
  };

  return (
    <div className="min-h-screen bg-gray-50 font-['Roboto']">
      {/* Header */}
      <header className="bg-[#11E3A8A] text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name="Shield" size={32} />
              <h1 className="text-2xl font-bold">Система управления ГБР</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="font-semibold">Участков на охране: {stats.protected}</span>
              </div>
              <div className="text-sm">
                <span className="font-semibold">Экстренных вызовов: {stats.emergency}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <Tabs defaultValue="monitoring" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="home">Главная</TabsTrigger>
            <TabsTrigger value="control">Управление участками</TabsTrigger>
            <TabsTrigger value="monitoring">Мониторинг</TabsTrigger>
            <TabsTrigger value="alarms">Сигнализация</TabsTrigger>
            <TabsTrigger value="reports">Отчеты</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-700">Всего участков</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#11E3A8A]">{stats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-700">На охране</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats.protected}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-700">Экстренные вызовы</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{stats.emergency}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-700">Срабатывания</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{stats.alarm}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="control" className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Управление охранными участками</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {properties.map((property) => (
                <Card 
                  key={property.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${getPropertyCardClass(property.status)}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base font-semibold">
                        Участок #{property.id}
                      </CardTitle>
                      {getStatusBadge(property.status)}
                    </div>
                    <p className="text-sm text-gray-600">{property.address}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">
                        Последняя проверка: {property.lastCheck}
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => setSelectedProperty(property)}
                          >
                            Управление
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Управление участком #{property.id}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="text-sm text-gray-600">
                              <p><strong>Адрес:</strong> {property.address}</p>
                              <p><strong>Статус:</strong> {getStatusBadge(property.status)}</p>
                              <p><strong>Последняя проверка:</strong> {property.lastCheck}</p>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Button
                                onClick={() => handleProtectionToggle(property.id)}
                                className={property.status === 'protected' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                              >
                                <Icon name={property.status === 'protected' ? 'ShieldOff' : 'Shield'} size={16} className="mr-2" />
                                {property.status === 'protected' ? 'Снять с охраны' : 'Поставить на охрану'}
                              </Button>
                              <Button
                                onClick={() => handleEmergencyCall(property.id)}
                                variant="destructive"
                                className="bg-red-700 hover:bg-red-800"
                              >
                                <Icon name="Phone" size={16} className="mr-2" />
                                Экстренный вызов ГБР
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Мониторинг состояния участков</h2>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {properties.map((property) => (
                <div 
                  key={property.id} 
                  className={`p-4 rounded-lg border ${
                    property.status === 'emergency' ? 'bg-red-100 border-red-300' :
                    property.status === 'alarm' ? 'bg-orange-100 border-orange-300' :
                    property.status === 'protected' ? 'bg-green-100 border-green-300' :
                    'bg-gray-100 border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold text-gray-800">#{property.id}</span>
                      <span className="text-sm text-gray-600">{property.address}</span>
                      {getStatusBadge(property.status)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {property.lastCheck}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alarms" className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Управление сигнализацией</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.filter(p => p.status === 'protected').map((property) => (
                <Card key={property.id} className="border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Участок #{property.id}</CardTitle>
                    <p className="text-sm text-gray-600">{property.address}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        onClick={() => triggerAlarm(property.id)}
                        variant="outline"
                        size="sm"
                        className="w-full border-orange-500 text-orange-700 hover:bg-orange-50"
                      >
                        <Icon name="Bell" size={16} className="mr-2" />
                        Тестировать сигнализацию
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {properties.filter(p => p.status === 'alarm').length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-orange-700 mb-4">Активные срабатывания</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties.filter(p => p.status === 'alarm').map((property) => (
                    <Card key={property.id} className="border-orange-500 bg-orange-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base text-orange-800">Участок #{property.id}</CardTitle>
                        <p className="text-sm text-orange-600">{property.address}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-xs text-orange-600">
                            Сработала: {property.lastCheck}
                          </p>
                          <Button
                            onClick={() => clearAlarm(property.id)}
                            size="sm"
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <Icon name="CheckCircle" size={16} className="mr-2" />
                            Отключить сигнализацию
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Отчеты и статистика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Icon name="FileText" size={48} className="mx-auto mb-4 text-gray-400" />
                  <p>Раздел отчетов находится в разработке</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Настройки системы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Icon name="Settings" size={48} className="mx-auto mb-4 text-gray-400" />
                  <p>Настройки системы находятся в разработке</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;