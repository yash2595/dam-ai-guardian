// Backend API Service for HydroLake Advanced Features
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

let socket: Socket | null = null;

// Initialize Socket.IO connection
export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('✅ Connected to HydroLake Backend Server');
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from HydroLake Backend Server');
    });

    socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
    });
  }
  return socket;
};

// Get socket instance
export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// ========================================
// AI Risk Assessment Service
// ========================================
export const aiService = {
  assessRisk: async (sensorData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/risk-assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensorData })
      });
      return await response.json();
    } catch (error) {
      console.error('AI Risk Assessment Error:', error);
      return { success: false, error: 'Failed to assess risk' };
    }
  },

  trainModel: async (trainingData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainingData })
      });
      return await response.json();
    } catch (error) {
      console.error('AI Training Error:', error);
      return { success: false, error: 'Failed to start training' };
    }
  }
};

// ========================================
// Weather Service
// ========================================
export const weatherService = {
  getCurrentWeather: async (lat: number = 28.6139, lon: number = 77.2090) => {
    try {
      const response = await fetch(`${API_BASE_URL}/weather/current?lat=${lat}&lon=${lon}`);
      return await response.json();
    } catch (error) {
      console.error('Weather Error:', error);
      return { success: false, error: 'Failed to fetch weather data' };
    }
  },

  getForecast: async (lat: number = 28.6139, lon: number = 77.2090, days: number = 7) => {
    try {
      const response = await fetch(`${API_BASE_URL}/weather/forecast?lat=${lat}&lon=${lon}&days=${days}`);
      return await response.json();
    } catch (error) {
      console.error('Forecast Error:', error);
      return { success: false, error: 'Failed to fetch forecast' };
    }
  },

  analyzeImpact: async (weatherData: any, damData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/weather/impact-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weatherData, damData })
      });
      return await response.json();
    } catch (error) {
      console.error('Impact Analysis Error:', error);
      return { success: false, error: 'Failed to analyze impact' };
    }
  }
};

// ========================================
// IoT Sensor Service
// ========================================
export const iotService = {
  getAllSensors: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/iot/sensors`);
      return await response.json();
    } catch (error) {
      console.error('IoT Sensors Error:', error);
      return { success: false, error: 'Failed to fetch sensors' };
    }
  },

  getSensorData: async (sensorId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/iot/sensor/${sensorId}`);
      return await response.json();
    } catch (error) {
      console.error('Sensor Data Error:', error);
      return { success: false, error: 'Failed to fetch sensor data' };
    }
  },

  calibrateSensor: async (sensorId: string, calibrationData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/iot/sensor/${sensorId}/calibrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calibrationData })
      });
      return await response.json();
    } catch (error) {
      console.error('Sensor Calibration Error:', error);
      return { success: false, error: 'Failed to calibrate sensor' };
    }
  }
};

// ========================================
// Analytics Service
// ========================================
export const analyticsService = {
  getOverview: async (startDate: string, endDate: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/overview?startDate=${startDate}&endDate=${endDate}`);
      return await response.json();
    } catch (error) {
      console.error('Analytics Overview Error:', error);
      return { success: false, error: 'Failed to fetch analytics' };
    }
  },

  getWaterFlow: async (days: number = 30) => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/water-flow?days=${days}`);
      return await response.json();
    } catch (error) {
      console.error('Water Flow Error:', error);
      return { success: false, error: 'Failed to fetch water flow data' };
    }
  },

  generateReport: async (reportType: string, parameters: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType, parameters })
      });
      return await response.json();
    } catch (error) {
      console.error('Report Generation Error:', error);
      return { success: false, error: 'Failed to generate report' };
    }
  }
};

// ========================================
// 3D Visualization Service
// ========================================
export const visualization3DService = {
  getStructureData: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/3d/structure-data`);
      return await response.json();
    } catch (error) {
      console.error('3D Structure Error:', error);
      return { success: false, error: 'Failed to fetch structure data' };
    }
  },

  getStressPoints: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/3d/stress-points`);
      return await response.json();
    } catch (error) {
      console.error('Stress Points Error:', error);
      return { success: false, error: 'Failed to fetch stress points' };
    }
  }
};

// ========================================
// Real-time Socket Events
// ========================================
export const subscribeToSensorUpdates = (callback: (data: any) => void) => {
  const socketInstance = getSocket();
  socketInstance.on('sensor-update', callback);
  return () => socketInstance.off('sensor-update', callback);
};

export const subscribeToAIPredictions = (callback: (data: any) => void) => {
  const socketInstance = getSocket();
  socketInstance.on('ai-prediction', callback);
  return () => socketInstance.off('ai-prediction', callback);
};

export const subscribeToTrainingProgress = (callback: (data: any) => void) => {
  const socketInstance = getSocket();
  socketInstance.on('training-progress', callback);
  return () => socketInstance.off('training-progress', callback);
};

export const subscribeToSensorCalibration = (callback: (data: any) => void) => {
  const socketInstance = getSocket();
  socketInstance.on('sensor-calibrated', callback);
  return () => socketInstance.off('sensor-calibrated', callback);
};

export const subscribeToPushNotifications = (callback: (data: any) => void) => {
  const socketInstance = getSocket();
  socketInstance.on('push-notification', callback);
  return () => socketInstance.off('push-notification', callback);
};

export const requestManualUpdate = () => {
  const socketInstance = getSocket();
  socketInstance.emit('request-manual-update');
};

// Export all services
export default {
  initSocket,
  getSocket,
  disconnectSocket,
  aiService,
  weatherService,
  iotService,
  analyticsService,
  visualization3DService,
  subscribeToSensorUpdates,
  subscribeToAIPredictions,
  subscribeToTrainingProgress,
  subscribeToSensorCalibration,
  subscribeToPushNotifications,
  requestManualUpdate
};
