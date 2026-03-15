const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iotController');

router.get('/sensors', iotController.getSensors);
router.get('/training-data', iotController.getTrainingData);
router.get('/sensor/:id', iotController.getLatestSensorData);
router.post('/sensor/:id/calibrate', iotController.calibrateSensor);

module.exports = router;
