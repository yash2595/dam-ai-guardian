const { SensorData } = require('../database/models');

// Get all sensors (active sensors list)
exports.getSensors = async (req, res) => {
  try {
    // In a real app, sensors might be in their own collection.
    // For now, we return a standard list or derive it from SensorData.
    const sensors = [
      { id: 'WL-001', name: 'Water Level Sensor', location: 'Reservoir', status: 'active' },
      { id: 'PR-001', name: 'Pressure Sensor', location: 'Base', status: 'active' },
      { id: 'SE-001', name: 'Seepage Monitor', location: 'Foundation', status: 'active' },
      { id: 'SS-001', name: 'Structural Stress', location: 'Wall', status: 'active' },
      { id: 'TP-001', name: 'Temperature Probe', location: 'Core', status: 'active' },
      { id: 'FL-001', name: 'Flow Meter', location: 'Spillway', status: 'active' },
      { id: 'VB-001', name: 'Vibration Sensor', location: 'Turbine', status: 'active' },
      { id: 'TU-001', name: 'Turbidity Sensor', location: 'Outlet', status: 'active' },
      { id: 'PH-001', name: 'pH Monitor', location: 'Water', status: 'active' },
      { id: 'DO-001', name: 'Dissolved Oxygen', location: 'Water', status: 'active' }
    ];
    
    res.json({
      success: true,
      data: sensors
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get aggregated telemetry for visualization training/calibration
exports.getTrainingData = async (req, res) => {
  try {
    const sampleSize = Math.max(20, Math.min(500, Number(req.query.sampleSize) || 120));
    const records = await SensorData.find()
      .sort({ timestamp: -1 })
      .limit(sampleSize);

    if (!records || records.length === 0) {
      return res.json({
        success: true,
        data: {
          sampleSize: 0,
          profile: null,
          latestTimestamp: null
        }
      });
    }

    const metrics = ['waterLevel', 'pressure', 'temperature', 'structuralStress', 'seepage', 'vibration', 'flowRate'];

    const profile = metrics.reduce((acc, metric) => {
      const values = records
        .map((r) => Number(r?.[metric]))
        .filter((v) => Number.isFinite(v));

      if (values.length === 0) {
        acc[metric] = { min: 0, max: 0, avg: 0 };
        return acc;
      }

      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      acc[metric] = { min, max, avg };
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        sampleSize: records.length,
        profile,
        latestTimestamp: records[0]?.timestamp || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get latest data for a specific sensor
exports.getLatestSensorData = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Attempt to find latest real data from MongoDB
    const latest = await SensorData.findOne({ 
      $or: [{ sensorId: id }, { damId: id }] 
    }).sort({ timestamp: -1 });
    
    if (latest) {
      return res.json({
        success: true,
        data: latest
      });
    }
    
    // Fallback to mock if no data exists yet
    res.json({
      success: true,
      data: {
        sensorId: id,
        value: 50 + Math.random() * 40,
        unit: 'units',
        timestamp: new Date().toISOString(),
        status: 'simulated'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Calibrate sensor (mock action)
exports.calibrateSensor = async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      message: `Calibration started for sensor ${id}`,
      estimatedTime: '3 seconds'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
