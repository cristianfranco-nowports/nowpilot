import React, { useEffect, useState } from 'react';
import { TrackingVisualization, TrackingMilestone } from '../../types/chat';
import { MapPin, Ship, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface ShipmentTrackerProps {
  data: TrackingVisualization;
}

const ShipmentTracker: React.FC<ShipmentTrackerProps> = ({ data }) => {
  const [activeStep, setActiveStep] = useState(0);
  const completedMilestones = data.milestones.filter(m => m.status === 'completed').length;

  useEffect(() => {
    // Animate through milestones when component mounts
    const timer = setTimeout(() => {
      if (activeStep < completedMilestones) {
        setActiveStep(prev => prev + 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [activeStep, completedMilestones]);

  // Calculate progress percentage
  const progressPercentage = (completedMilestones / data.milestones.length) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 max-w-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-blue-800">Shipment #{data.shipmentId}</h3>
        <div className="text-sm text-gray-600">
          <span className="font-medium">ETA:</span> {data.estimatedArrival}
        </div>
      </div>

      {/* Map Visualization */}
      <div className="relative h-48 bg-blue-50 rounded-lg mb-4 overflow-hidden">
        <div className="absolute inset-0 p-2">
          {/* Simplified Map Visualization */}
          <div className="relative w-full h-full bg-blue-100 rounded border border-blue-200">
            {/* Origin Point */}
            <div className="absolute top-1/2 left-[10%] transform -translate-y-1/2">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mb-1"></div>
                <span className="text-xs font-medium text-gray-700">{data.origin.name}</span>
              </div>
            </div>

            {/* Destination Point */}
            <div className="absolute top-1/2 right-[10%] transform -translate-y-1/2">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mb-1"></div>
                <span className="text-xs font-medium text-gray-700">{data.destination.name}</span>
              </div>
            </div>

            {/* Progress Line */}
            <div className="absolute top-1/2 left-[10%] right-[10%] h-1 bg-gray-300 transform -translate-y-1/2">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>

            {/* Current Location - Animated Ship */}
            <div className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 ease-out"
                style={{ left: `${10 + progressPercentage * 0.8}%` }}>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full mb-1 animate-pulse">
                  <Ship size={16} />
                </div>
                <span className="text-xs font-medium text-gray-700 bg-white px-1 rounded">
                  {data.currentLocation.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carrier Information */}
      <div className="mb-4 p-2 bg-gray-50 rounded-lg">
        <div className="flex justify-between">
          <div>
            <span className="text-sm font-medium text-gray-700">Carrier:</span>
            <span className="text-sm ml-1">{data.carrier}</span>
          </div>
          {data.vesselName && (
            <div>
              <span className="text-sm font-medium text-gray-700">Vessel:</span>
              <span className="text-sm ml-1">{data.vesselName}</span>
            </div>
          )}
        </div>
        {data.containerNumbers && data.containerNumbers.length > 0 && (
          <div className="mt-1">
            <span className="text-sm font-medium text-gray-700">Container:</span>
            <span className="text-sm ml-1">{data.containerNumbers.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Timeline Visualization */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        {data.milestones.map((milestone, index) => (
          <div key={index} className="flex mb-4 relative">
            <div className="relative flex items-center justify-center ml-1 mr-3">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                  milestone.status === 'completed' ? 'bg-green-500 text-white' : 
                  milestone.status === 'inProgress' ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}
              >
                {milestone.status === 'completed' ? (
                  <CheckCircle size={14} />
                ) : milestone.status === 'inProgress' ? (
                  <TrendingUp size={14} />
                ) : (
                  <Clock size={14} />
                )}
              </div>
              {index <= activeStep && index < completedMilestones && (
                <div className="absolute inset-0 z-0 animate-ping-slow rounded-full bg-green-200 opacity-75"></div>
              )}
            </div>
            <div className={`flex-grow ${
              index <= activeStep ? 'opacity-100' : 'opacity-60'
            } transition-opacity duration-300`}>
              <div className="text-sm font-medium text-gray-800">{milestone.name}</div>
              <div className="text-xs text-gray-500">{milestone.date}</div>
              {milestone.location && (
                <div className="text-xs flex items-center text-gray-500 mt-0.5">
                  <MapPin size={12} className="mr-1" /> {milestone.location.name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShipmentTracker; 