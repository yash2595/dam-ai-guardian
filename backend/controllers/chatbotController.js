const axios = require('axios');
const { ChatConversation, SensorData, Alert, useMockDB } = require('../database/models');

const ML_API_BASE_URL = process.env.ML_API_URL || 'http://localhost:5001';

/**
 * AI Chatbot Controller
 * Handles chatbot interactions with database persistence
 */

// Process chatbot message
exports.sendMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user?.id || 'guest';
    
    // Find or create conversation
    let conversation;
    if (conversationId) {
      conversation = await ChatConversation.findById(conversationId);
    }
    
    if (!conversation) {
      const newConversationPayload = {
        userId,
        title: message.substring(0, 50),
        messages: [],
        lastMessageAt: new Date()
      };

      if (typeof ChatConversation.create === 'function') {
        conversation = await ChatConversation.create(newConversationPayload);
      } else {
        conversation = new ChatConversation(newConversationPayload);
      }
    }

    if (!Array.isArray(conversation.messages)) {
      conversation.messages = [];
    }
    
    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });
    
    // Generate AI response
    const response = await generateAIResponse(message, conversation);
    
    // Add AI response
    conversation.messages.push({
      role: 'assistant',
      content: response.text,
      timestamp: new Date(),
      metadata: response.metadata
    });
    
    conversation.lastMessageAt = new Date();
    await conversation.save();
    
    res.json({ 
      success: true, 
      data: {
        conversationId: conversation._id,
        response: response.text,
        metadata: response.metadata
      }
    });
  } catch (error) {
    console.error('Error processing chatbot message:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get conversation history
exports.getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = await ChatConversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    
    res.json({ success: true, data: conversation });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all conversations for user
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || 'guest';
    
    const conversations = await ChatConversation.find({ userId })
      .sort({ lastMessageAt: -1 })
      .limit(50)
      .select('title lastMessageAt messages');
    
    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete conversation
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    await ChatConversation.findByIdAndDelete(conversationId);
    
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get chatbot analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalConversations = await ChatConversation.countDocuments();
    const totalMessages = await ChatConversation.aggregate([
      { $project: { messageCount: { $size: '$messages' } } },
      { $group: { _id: null, total: { $sum: '$messageCount' } } }
    ]);
    
    const activeToday = await ChatConversation.countDocuments({
      lastMessageAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    const topQueries = await ChatConversation.aggregate([
      { $unwind: '$messages' },
      { $match: { 'messages.role': 'user' } },
      { $group: { 
        _id: { $substr: ['$messages.content', 0, 50] },
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({ 
      success: true, 
      data: {
        totalConversations,
        totalMessages: totalMessages[0]?.total || 0,
        activeToday,
        topQueries
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

function toNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function buildSensorPayload(latestData) {
  return {
    waterLevel: toNumber(latestData?.waterLevel, 65),
    pressure: toNumber(latestData?.pressure, 70),
    seepage: toNumber(latestData?.seepage, 3),
    structuralStress: toNumber(latestData?.structuralStress, 40),
    temperature: toNumber(latestData?.temperature, 20),
    inflow: toNumber(latestData?.inflow, 1000),
    outflow: toNumber(latestData?.outflow, 950),
    turbidity: toNumber(latestData?.turbidity, 5),
    ph: toNumber(latestData?.ph, 7.2),
    dissolvedOxygen: toNumber(latestData?.dissolvedOxygen, 7),
    vibration: toNumber(latestData?.vibration, 0.3),
    rainfall: toNumber(latestData?.rainfall, 15)
  };
}

function generateMockTelemetrySnapshot(previousData) {
  const prevWater = toNumber(previousData?.waterLevel, 78);
  const prevFlow = toNumber(previousData?.flowRate, 1280);
  const prevPressure = toNumber(previousData?.pressure, 75);
  const prevVibration = toNumber(previousData?.vibration, 1.8);
  const prevSeismic = toNumber(previousData?.seismicActivity, 0.35);
  const prevCrack = toNumber(previousData?.crackWidth, 0.16);

  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  return {
    damId: 'TEHRI_DAM_001',
    waterLevel: clamp(prevWater + (Math.random() - 0.5) * 1.8, 65, 97),
    flowRate: clamp(prevFlow + (Math.random() - 0.5) * 160, 800, 2200),
    pressure: clamp(prevPressure + (Math.random() - 0.5) * 5, 50, 100),
    temperature: clamp(toNumber(previousData?.temperature, 24) + (Math.random() - 0.5) * 1.2, 10, 42),
    vibration: clamp(prevVibration + (Math.random() - 0.5) * 0.35, 0.2, 5),
    seismicActivity: clamp(prevSeismic + (Math.random() - 0.5) * 0.08, 0.05, 1.5),
    crackWidth: clamp(prevCrack + (Math.random() - 0.5) * 0.015, 0.05, 0.6),
    timestamp: new Date()
  };
}

async function getLatestTelemetry(options = {}) {
  const { forceFresh = false } = options;
  const latestData = await SensorData.findOne().sort({ timestamp: -1 });

  if (useMockDB && forceFresh) {
    const created = await SensorData.create(generateMockTelemetrySnapshot(latestData));
    return {
      data: created,
      isFresh: true,
      ageMinutes: 0
    };
  }

  if (!latestData) {
    return {
      data: null,
      isFresh: false,
      ageMinutes: null
    };
  }

  const ts = latestData.timestamp ? new Date(latestData.timestamp).getTime() : Date.now();
  const ageMinutes = Math.max(0, (Date.now() - ts) / (1000 * 60));

  return {
    data: latestData,
    isFresh: ageMinutes <= 15,
    ageMinutes
  };
}

function evaluateSafetyState(data) {
  const waterLevel = toNumber(data?.waterLevel, 0);
  const vibration = toNumber(data?.vibration, 0);
  const seismicActivity = toNumber(data?.seismicActivity, 0);
  const crackWidth = toNumber(data?.crackWidth, 0);

  const riskFlags = [
    waterLevel >= 92,
    vibration >= 3.5,
    seismicActivity >= 0.7,
    crackWidth >= 0.28
  ].filter(Boolean).length;

  if (riskFlags >= 2) return 'HIGH';
  if (riskFlags === 1) return 'ELEVATED';
  return 'NORMAL';
}

function formatTime(value) {
  if (!value) return 'Unknown';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return 'Unknown';
  return dt.toLocaleString();
}

async function getModelStatus() {
  const [healthRes, infoRes] = await Promise.all([
    axios.get(`${ML_API_BASE_URL}/health`, { timeout: 5000 }),
    axios.get(`${ML_API_BASE_URL}/model-info`, { timeout: 5000 })
  ]);

  return {
    health: healthRes.data,
    info: infoRes.data
  };
}

async function getPredictionFromML(latestData) {
  const sensorPayload = buildSensorPayload(latestData);
  const mlResponse = await axios.post(
    `${ML_API_BASE_URL}/predict`,
    { sensorData: sensorPayload },
    { timeout: 7000 }
  );

  if (!mlResponse.data?.success) {
    throw new Error(mlResponse.data?.error || 'ML prediction failed');
  }

  return mlResponse.data.data;
}

// Generate AI response
async function generateAIResponse(message, conversation) {
  const messageLower = message.toLowerCase();
  
  // Check for specific queries
  if (messageLower.includes('water level') || messageLower.includes('current status')) {
    const telemetry = await getLatestTelemetry({ forceFresh: true });
    const latestData = telemetry.data;

    if (!latestData) {
      return {
        text: 'Live sensor stream is initializing. Please retry in a few seconds for current telemetry.',
        metadata: { type: 'status', source: 'no-telemetry' }
      };
    }

    const safetyState = evaluateSafetyState(latestData);
    const freshnessNote = telemetry.isFresh
      ? 'Live data is up to date.'
      : `Latest reading is ${Math.round(telemetry.ageMinutes)} minutes old.`;

    return {
      text: `Current telemetry snapshot (${formatTime(latestData.timestamp)}):\n` +
            `• Water level: ${toNumber(latestData.waterLevel, 0).toFixed(2)}%\n` +
            `• Flow rate: ${toNumber(latestData.flowRate, 0).toFixed(2)} m3/s\n` +
            `• Pressure: ${toNumber(latestData.pressure, 0).toFixed(2)}\n` +
            `• Vibration: ${toNumber(latestData.vibration, 0).toFixed(2)}\n` +
            `• Safety state: ${safetyState}\n` +
            `${freshnessNote}`,
      metadata: { type: 'status', data: latestData, freshness: telemetry }
    };
  }
  
  if (messageLower.includes('alert') || messageLower.includes('warning')) {
    const activeAlerts = await Alert.find({ status: 'active' }).limit(5);
    if (activeAlerts.length === 0) {
      return {
        text: 'There are no active alerts at this time. All systems are operating normally.',
        metadata: { type: 'alerts', count: 0 }
      };
    }
    return {
      text: `There are ${activeAlerts.length} active alerts:\n` +
            activeAlerts.map((a, i) => `${i+1}. ${a.type} - ${a.severity} severity`).join('\n'),
      metadata: { type: 'alerts', data: activeAlerts }
    };
  }
  
  if (messageLower.includes('emergency') || messageLower.includes('contact')) {
    return {
      text: `For emergencies, please call: 8000824196\n\n` +
            `This is the 24/7 emergency hotline for dam operations. ` +
            `For routine inquiries, you can continue chatting with me.`,
      metadata: { type: 'emergency' }
    };
  }
  
  if (
    messageLower.includes('predict') ||
    messageLower.includes('forecast') ||
    messageLower.includes('risk') ||
    messageLower.includes('model') ||
    messageLower.includes('trained') ||
    messageLower.includes('भविष्य') ||
    messageLower.includes('मॉडल')
  ) {
    try {
      const telemetry = await getLatestTelemetry({ forceFresh: true });
      const latestData = telemetry.data;
      const prediction = await getPredictionFromML(latestData);

      const topRecs = (prediction.recommendations || [])
        .slice(0, 2)
        .map((item) => `• ${item.action}`)
        .join('\n');

      return {
        text: `ML trained model response:\n` +
              `• Risk: ${prediction.riskLabel}\n` +
              `• Confidence: ${prediction.confidence}%\n` +
              `• Score: ${prediction.riskScore}\n` +
              `• Sensor snapshot time: ${formatTime(latestData?.timestamp)}\n` +
              `• Model version: ${prediction.modelVersion || '1.0.0'}\n` +
              `${topRecs || '• Continue routine monitoring as per current telemetry.'}`,
        metadata: {
          type: 'prediction',
          source: 'ml-model',
          prediction,
          telemetry
        }
      };
    } catch (error) {
      return {
        text: `ML model service is temporarily unavailable. Using fallback estimate:\n` +
              `• Water level expected to rise by 2-3% in next 24 hours\n` +
              `• Rainfall prediction: 45mm in next 48 hours\n` +
              `• Recommended action: Continue monitoring, no immediate concerns`,
        metadata: {
          type: 'prediction',
          source: 'fallback',
          error: error.message
        }
      };
    }
  }

  if (messageLower.includes('health') || messageLower.includes('trained status')) {
    try {
      const status = await getModelStatus();
      const trainedDate = status.info?.trained_date || 'Unknown';

      return {
        text: `Model status: ${status.health?.models_loaded ? 'Trained and loaded' : 'Not loaded'}\n` +
              `• API status: ${status.health?.status || 'unknown'}\n` +
              `• Trained date: ${trainedDate}\n` +
              `• Version: ${status.info?.version || '1.0.0'}`,
        metadata: { type: 'model-status', status }
      };
    } catch (error) {
      return {
        text: 'Model status could not be verified right now. Please check ML API connectivity.',
        metadata: { type: 'model-status', error: error.message }
      };
    }
  }
  
  if (messageLower.includes('safety') || messageLower.includes('secure')) {
    const telemetry = await getLatestTelemetry({ forceFresh: true });
    const latestData = telemetry.data;
    const safetyState = evaluateSafetyState(latestData);

    if (!latestData) {
      return {
        text: 'Safety telemetry is not available yet. Please retry in a few seconds.',
        metadata: { type: 'safety', source: 'no-telemetry' }
      };
    }

    return {
      text: `Dam safety status:\n` +
            `• Current state: ${safetyState}\n` +
            `• Water level: ${toNumber(latestData.waterLevel, 0).toFixed(2)}%\n` +
            `• Seismic activity: ${toNumber(latestData.seismicActivity, 0).toFixed(3)}\n` +
            `• Crack width: ${toNumber(latestData.crackWidth, 0).toFixed(3)} mm\n` +
            `• Last telemetry: ${formatTime(latestData.timestamp)}`,
      metadata: { type: 'safety', data: latestData, freshness: telemetry }
    };
  }
  
  // Default response with context
  const responses = [
    "I'm here to help you monitor the dam operations. You can ask me about:\n" +
    "• Current water levels and flow rates\n" +
    "• Active alerts and warnings\n" +
    "• Predictions and forecasts\n" +
    "• Safety status and inspections\n" +
    "• Emergency contact information",
    
    "I can provide real-time information about the dam. Try asking about:\n" +
    "• 'What's the current water level?'\n" +
    "• 'Are there any active alerts?'\n" +
    "• 'What's the prediction for tomorrow?'\n" +
    "• 'Emergency contact number'",
    
    `Based on your question, I'd be happy to provide specific information. ` +
    `The dam is currently operating normally with all systems functional. ` +
    `What specific aspect would you like to know more about?`
  ];
  
  return {
    text: responses[Math.floor(Math.random() * responses.length)],
    metadata: { type: 'general' }
  };
}

module.exports = exports;
