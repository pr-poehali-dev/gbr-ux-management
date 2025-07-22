import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface Property {
  id: number;
  address: string;
  status: 'protected' | 'unprotected' | 'emergency' | 'alarm';
  lastCheck: string;
}

const Index = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchId, setSearchId] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [view, setView] = useState<'grid' | 'compact'>('compact');

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

    return () => clearInterval(interval);
  }, []);

  // Горячие клавиши
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl + числа для быстрых действий
      if (e.ctrlKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            toggleSelectedProtection();
            break;
          case '2':
            e.preventDefault();
            emergencyCallSelected();
            break;
          case '3':
            e.preventDefault();
            clearSelectedAlarms();
            break;
          case 'a':
            e.preventDefault();
            selectAll();
            break;
        }
      }
      // Escape для сброса выделения
      if (e.key === 'Escape') {
        setSelectedIds(new Set());
        setSearchId('');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedIds]);

  const handleProtectionToggle = useCallback((id: number) => {
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
  }, []);

  const handleEmergencyCall = useCallback((id: number) => {
    setProperties(prev => {
      const updated = prev.map(prop => 
        prop.id === id ? { ...prop, status: 'emergency' as const, lastCheck: new Date().toLocaleString('ru-RU') } : prop
      );
      // Переместить экстренный участок в начало списка
      const emergency = updated.find(p => p.id === id)!;
      const others = updated.filter(p => p.id !== id);
      return [emergency, ...others];
    });
  }, []);

  const triggerAlarm = (id: number) => {
    setProperties(prev => prev.map(prop => 
      prop.id === id ? { ...prop, status: 'alarm' as const, lastCheck: new Date().toLocaleString('ru-RU') } : prop
    ));
  };

  const clearAlarm = useCallback((id: number) => {
    setProperties(prev => prev.map(prop => 
      prop.id === id ? { ...prop, status: 'protected' as const, lastCheck: new Date().toLocaleString('ru-RU') } : prop
    ));
  };

  // Фильтрация и сортировка
  const filteredProperties = properties
    .filter(p => searchId ? p.id.toString().includes(searchId) : true)
    .sort((a, b) => {
      // Экстренные и тревожные первыми
      if (a.status === 'emergency' && b.status !== 'emergency') return -1;
      if (b.status === 'emergency' && a.status !== 'emergency') return 1;
      if (a.status === 'alarm' && b.status !== 'alarm') return -1;
      if (b.status === 'alarm' && a.status !== 'alarm') return 1;
      return a.id - b.id;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'protected': return 'bg-green-600';
      case 'unprotected': return 'bg-gray-400';
      case 'emergency': return 'bg-red-600 animate-pulse';
      case 'alarm': return 'bg-orange-500 animate-pulse';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'protected': return 'ОХРАНА';
      case 'unprotected': return 'СНЯТО';
      case 'emergency': return 'ВЫЕЗД ГБР';
      case 'alarm': return 'ТРЕВОГА';
      default: return 'НЕТ СВЯЗИ';
    }
  };

  const stats = {
    total: properties.length,
    protected: properties.filter(p => p.status === 'protected').length,
    emergency: properties.filter(p => p.status === 'emergency').length,
    alarm: properties.filter(p => p.status === 'alarm').length
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-['Roboto'] font-mono">
      {/* Минималистичный хедер */}
      <header className="bg-black border-b border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold text-green-400">ГБР СИСТЕМА</h1>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-green-400">{stats.protected} НА ОХРАНЕ</span>
              <span className="text-red-400">{stats.emergency} ЭКСТРЕННЫХ</span>
              <span className="text-orange-400">{stats.alarm} ТРЕВОГ</span>
            </div>
          </div>
          
          {/* Быстрые действия */}
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="№ участка"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-24 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView(view === 'grid' ? 'compact' : 'grid')}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Icon name={view === 'grid' ? 'List' : 'Grid3X3'} size={16} />
            </Button>
          </div>
        </div>
      </header>

      {/* Панель массовых действий */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-900 px-6 py-2 border-b border-blue-700">
          <div className="flex items-center justify-between">
            <span className="text-blue-200">Выбрано: {selectedIds.size}</span>
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={toggleSelectedProtection}
                className="bg-green-700 hover:bg-green-600 text-xs"
              >
                ПЕРЕКЛЮЧИТЬ ОХРАНУ (Ctrl+1)
              </Button>
              <Button
                size="sm"
                onClick={emergencyCallSelected}
                className="bg-red-700 hover:bg-red-600 text-xs"
              >
                ЭКСТРЕННЫЙ ВЫЗОВ (Ctrl+2)
              </Button>
              <Button
                size="sm"
                onClick={clearSelectedAlarms}
                className="bg-orange-700 hover:bg-orange-600 text-xs"
              >
                СБРОС ТРЕВОГ (Ctrl+3)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Компактный список участков */}
      <div className="p-4">

        {view === 'compact' ? (
          <div className="space-y-1">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className={`flex items-center p-3 rounded cursor-pointer transition-colors ${
                  selectedIds.has(property.id) ? 'bg-blue-800' : 'bg-gray-800 hover:bg-gray-700'
                } ${property.status === 'emergency' ? 'border-l-4 border-red-500' : ''}
                ${property.status === 'alarm' ? 'border-l-4 border-orange-500' : ''}`}
                onClick={() => toggleSelection(property.id)}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <span className="font-bold text-lg w-12">#{property.id}</span>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(property.status)}`}></div>
                  <span className="font-semibold w-20 text-xs">{getStatusText(property.status)}</span>
                  <span className="text-gray-400 text-sm flex-1">{property.address}</span>
                  <span className="text-gray-500 text-xs">{property.lastCheck.split(', ')[1]}</span>
                </div>
                
                {/* Быстрые кнопки */}
                <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleProtectionToggle(property.id)}
                    className={`w-8 h-8 p-0 ${property.status === 'protected' ? 'text-red-400 hover:bg-red-900' : 'text-green-400 hover:bg-green-900'}`}
                  >
                    <Icon name={property.status === 'protected' ? 'ShieldOff' : 'Shield'} size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEmergencyCall(property.id)}
                    className="w-8 h-8 p-0 text-red-400 hover:bg-red-900"
                  >
                    <Icon name="Phone" size={14} />
                  </Button>
                  {property.status === 'alarm' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => clearAlarm(property.id)}
                      className="w-8 h-8 p-0 text-orange-400 hover:bg-orange-900"
                    >
                      <Icon name="X" size={14} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Сетка участков
          <div className="grid grid-cols-8 gap-2">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className={`aspect-square flex flex-col items-center justify-center rounded cursor-pointer transition-all ${
                  selectedIds.has(property.id) ? 'ring-2 ring-blue-400' : ''
                } ${getStatusColor(property.status)} ${
                  property.status === 'emergency' || property.status === 'alarm' ? 'ring-2 ring-white' : ''
                }`}
                onClick={() => toggleSelection(property.id)}
                title={`${property.address} - ${getStatusText(property.status)}`}
              >
                <div className="text-white font-bold text-sm">#{property.id}</div>
                <div className="text-white text-xs text-center px-1">{getStatusText(property.status)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Подсказки горячих клавиш */}
      <div className="fixed bottom-4 right-4 bg-gray-800 p-3 rounded text-xs text-gray-400">
        <div>Ctrl+1: Переключить охрану</div>
        <div>Ctrl+2: Экстренный вызов</div>
        <div>Ctrl+3: Сброс тревог</div>
        <div>Ctrl+A: Выбрать все</div>
        <div>Esc: Сбросить выбор</div>
      </div>
    </div>
  );
};

export default Index;