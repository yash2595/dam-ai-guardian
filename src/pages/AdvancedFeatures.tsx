import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Box, 
  BarChart3,
  CloudSun,
  ChevronRight,
  Wifi
} from 'lucide-react';
import AIRiskAssessment from '@/components/AIRiskAssessment';
import DamVisualization3D from '@/components/DamVisualization3D';
import SmartAnalyticsDashboard from '@/components/SmartAnalyticsDashboard';
import EnhancedWeatherDashboard from '@/components/EnhancedWeatherDashboard';
import { useSimulatedSensorData } from '@/hooks/useAIRiskAssessment';
import { useLanguage } from '@/contexts/LanguageContext';

const AdvancedFeatures: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState('ai-analysis');
  const sensorData = useSimulatedSensorData();
  const featureContentRef = React.useRef<HTMLDivElement>(null);
  const { language, availableLanguages, t } = useLanguage();

  const handleFeatureClick = (featureId: string) => {
    setActiveFeature(featureId);
    // Scroll to feature content with smooth animation
    setTimeout(() => {
      featureContentRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };

  const features = [
    {
      id: 'ai-analysis',
      title: 'AI Risk Assessment',
      description: 'Machine learning predictions for dam failure probability',
      icon: Brain,
      badge: 'AI Powered',
      badgeVariant: 'default' as const,
      isNew: true
    },
    {
      id: '3d-visualization',
      title: '3D Dam Visualization',
      description: 'Interactive 3D model with real-time data overlay',
      icon: Box,
      badge: 'Interactive',
      badgeVariant: 'secondary' as const,
      isNew: true
    },

    {
      id: 'smart-analytics',
      title: 'Smart Analytics',
      description: 'Advanced data analysis and predictive insights',
      icon: BarChart3,
      badge: 'AI Analytics',
      badgeVariant: 'default' as const,
      isNew: true
    },
    {
      id: 'weather-integration',
      title: 'Weather Integration',
      description: 'Real-time weather data and impact analysis',
      icon: CloudSun,
      badge: 'Weather API',
      badgeVariant: 'secondary' as const,
      isNew: true
    },

  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Advanced Features</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover the cutting-edge technologies that make HydroLake the most advanced 
          dam monitoring system available today.
        </p>
      </div>

      {/* System Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Wifi className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">System Online & Ready</span>
          </div>
          <Badge variant="default" className="bg-green-600">Active</Badge>
        </CardContent>
      </Card>

      {/* Feature Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isActive = activeFeature === feature.id;
          
          return (
            <Card 
              key={feature.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                isActive ? 'ring-2 ring-blue-500 bg-blue-50 shadow-lg scale-105' : 'hover:ring-1 hover:ring-blue-300'
              }`}
              onClick={() => handleFeatureClick(feature.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <Icon className={`h-6 w-6 transition-colors ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                  <div className="flex flex-col items-end space-y-1">
                    <Badge variant={feature.badgeVariant}>{feature.badge}</Badge>
                    {feature.isNew && <Badge variant="outline" className="text-xs">NEW</Badge>}
                  </div>
                </div>
                <h3 className={`font-semibold transition-colors ${
                  isActive ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className="text-xs mt-1 text-gray-600">
                  {feature.description}
                </p>
                {isActive && (
                  <div className="flex items-center text-blue-600 text-xs mt-2 font-medium animate-pulse">
                    <span>Viewing Below</span>
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </div>
                )}
                {!isActive && (
                  <div className="flex items-center text-gray-400 text-xs mt-2 hover:text-blue-600 transition-colors">
                    <span>Click to View</span>
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Content */}
      <div ref={featureContentRef} className="scroll-mt-6">
        <Card className="border-2 border-blue-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="text-center text-2xl">
              {features.find(f => f.id === activeFeature)?.title || 'Feature Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {activeFeature === 'ai-analysis' && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold flex items-center justify-center space-x-2">
                    <Brain className="h-6 w-6" />
                    <span>AI-Powered Risk Assessment</span>
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Our advanced machine learning model analyzes multiple data sources to predict 
                    dam failure probability with 95% confidence, providing early warning systems 
                    that can save lives and prevent disasters.
                  </p>
                </div>
                <AIRiskAssessment />
              </div>
            )}

          {activeFeature === '3d-visualization' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold flex items-center justify-center space-x-2">
                  <Box className="h-6 w-6" />
                  <span>Interactive 3D Visualization</span>
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Explore the dam structure in 3D with real-time data overlays. Visualize water levels, 
                  pressure points, structural stress, and temperature gradients in an intuitive 
                  interactive environment.
                </p>
              </div>
              <DamVisualization3D 
                waterLevel={sensorData.waterLevel}
                pressure={sensorData.pressure}
                temperature={sensorData.temperature}
                seepage={sensorData.seepage}
                structuralStress={sensorData.structuralStress}
              />
            </div>
          )}



          {activeFeature === 'smart-analytics' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold flex items-center justify-center space-x-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>Smart Analytics Dashboard</span>
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Advanced data analytics with predictive insights, seasonal patterns, and 
                  intelligent maintenance scheduling powered by machine learning algorithms.
                </p>
              </div>

              <SmartAnalyticsDashboard />
            </div>
          )}

          {activeFeature === 'weather-integration' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold flex items-center justify-center space-x-2">
                  <CloudSun className="h-6 w-6" />
                  <span>Weather Integration System</span>
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Real-time weather data integration with impact analysis on dam operations, 
                  rainfall predictions, and flood risk assessment.
                </p>
              </div>

              <EnhancedWeatherDashboard />
            </div>
          )}
        </CardContent>
      </Card>
      </div>

    </div>
  );
};

export default AdvancedFeatures;