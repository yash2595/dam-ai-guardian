import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  AlertCircle,
  CheckCircle,
  Settings,
  RefreshCw,
  TrendingUp,
  Droplets,
  Thermometer,
  Gauge,
  Cloud
} from 'lucide-react';
import { useIoTSensors } from '@/hooks/useIoTSensors';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const IoTDashboard: React.FC = () => {
  const {
    sensors,
    isConnected,
    messageCount,
    getSensorsByType,
    getDataStream,
    resetSensorStatus,
    getHealthStatus
  } = useIoTSensors();

  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const healthStatus = getHealthStatus();

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'water_level': return <Droplets className="h-5 w-5" />;
      case 'flow_rate': return <Activity className="h-5 w-5" />;
      case 'pressure': return <Gauge className="h-5 w-5" />;
      case 'temperature': return <Thermometer className="h-5 w-5" />;
      case 'rainfall': return <Cloud className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': return <Badge variant="default" className="bg-green-600">Online</Badge>;
      case 'offline': return <Badge variant="secondary">Offline</Badge>;
      case 'maintenance': return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Maintenance</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const selectedSensor = selectedSensorId ? sensors.find(s => s.id === selectedSensorId) : null;
  const sensorDataStream = selectedSensorId ? getDataStream(selectedSensorId, 10) : [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">IoT Sensor Network</h1>
          <p className="text-gray-600">Real-time monitoring of {sensors.length} connected sensors</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <Wifi className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-600">Disconnected</span>
              </>
            )}
          </div>
          <Badge variant="outline" className="text-sm">
            {messageCount.toLocaleString()} messages received
          </Badge>
        </div>
      </div>



      {/* Sensor Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Sensor Network Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All ({sensors.length})</TabsTrigger>
              <TabsTrigger value="water_level">Water Level</TabsTrigger>
              <TabsTrigger value="flow_rate">Flow Rate</TabsTrigger>
              <TabsTrigger value="pressure">Pressure</TabsTrigger>
              <TabsTrigger value="temperature">Temperature</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sensors.map((sensor) => (
                  <Card 
                    key={sensor.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedSensorId === sensor.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedSensorId(sensor.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getSensorIcon(sensor.type)}
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(sensor.status)}`} />
                        </div>
                        {getStatusBadge(sensor.status)}
                      </div>
                      
                      <h4 className="font-semibold text-sm mb-1">{sensor.name}</h4>
                      <p className="text-xs text-gray-600 mb-3">{sensor.location}</p>
                      
                      <div className="bg-gray-50 rounded p-2 mb-3 border border-gray-200">
                        <div className="text-2xl font-bold text-gray-400">
                          --
                        </div>
                        <div className="text-xs text-red-600">No Data (Offline)</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <Battery className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-400">--</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Signal className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-400">--</span>
                        </div>
                      </div>
                      
                      {sensor.status === 'error' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full mt-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            resetSensorStatus(sensor.id);
                          }}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Reset
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {['water_level', 'flow_rate', 'pressure', 'temperature', 'other'].map((type) => (
              <TabsContent key={type} value={type} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sensors
                    .filter(s => type === 'other' ? 
                      !['water_level', 'flow_rate', 'pressure', 'temperature'].includes(s.type) : 
                      s.type === type
                    )
                    .map((sensor) => (
                      <Card 
                        key={sensor.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedSensorId === sensor.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedSensorId(sensor.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {getSensorIcon(sensor.type)}
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(sensor.status)}`} />
                            </div>
                            {getStatusBadge(sensor.status)}
                          </div>
                          
                          <h4 className="font-semibold text-sm mb-1">{sensor.name}</h4>
                          <p className="text-xs text-gray-600 mb-3">{sensor.location}</p>
                          
                          <div className="bg-gray-50 rounded p-2 mb-3 border border-gray-200">
                            <div className="text-2xl font-bold text-gray-400">
                              --
                            </div>
                            <div className="text-xs text-red-600">No Data (Offline)</div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center space-x-1">
                              <Battery className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-400">--</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Signal className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-400">--</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Selected Sensor Details */}
      {selectedSensor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Sensor Details: {selectedSensor.name}</span>
              <Button variant="outline" size="sm" onClick={() => setSelectedSensorId(null)}>
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-4">Information</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sensor ID:</span>
                    <span className="font-mono">{selectedSensor.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="capitalize">{selectedSensor.type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span>{selectedSensor.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    {getStatusBadge(selectedSensor.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Update:</span>
                    <span>{selectedSensor.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Battery:</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={selectedSensor.battery} className="w-20 h-2" />
                      <span>{selectedSensor.battery.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Signal:</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={selectedSensor.signalStrength} className="w-20 h-2" />
                      <span>{selectedSensor.signalStrength.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Real-time Data Stream (Last 10 minutes)</h4>
                {sensorDataStream.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={sensorDataStream.map(d => ({
                      time: d.timestamp.toLocaleTimeString(),
                      value: d.value
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#0088FE" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <p>Collecting data stream...</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IoTDashboard;
