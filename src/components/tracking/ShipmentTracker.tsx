import React, { useEffect, useState } from 'react';
import { TrackingVisualization, TrackingMilestone } from '../../types/chat';
import { MapPin, Ship, CheckCircle, Clock, TrendingUp, X, ExternalLink } from 'lucide-react';

interface ShipmentTrackerProps {
  data: TrackingVisualization;
  theme?: 'light' | 'dark';
}

interface MapLocation {
  name: string;
  lat: number;
  lng: number;
}

const ShipmentTracker: React.FC<ShipmentTrackerProps> = ({ data, theme = 'light' }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
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

  // Function to open location modal
  const openLocationModal = (location: MapLocation) => {
    setSelectedLocation(location);
    setShowMap(true);
  };

  // Open Google Maps in a new tab
  const openGoogleMapsInNewTab = (location: MapLocation) => {
    window.open(`https://www.google.com/maps?q=${location.lat},${location.lng}`, '_blank');
  };

  // Define theme classes
  const themeClasses = {
    container: theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800',
    header: theme === 'dark' ? 'text-blue-300' : 'text-blue-800',
    subtext: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    map: theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50',
    mapBorder: theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-blue-200 bg-blue-100',
    infoPanel: theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50',
    timelineBg: theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200',
    milestonePending: theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-500',
    modal: theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800',
    buttonPrimary: theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white',
  };

  return (
    <div className={`${themeClasses.container} rounded-lg shadow-md p-4 mb-4 max-w-full`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className={`text-lg font-semibold ${themeClasses.header}`}>Shipment #{data.shipmentId}</h3>
        <div className={`text-sm ${themeClasses.subtext}`}>
          <span className="font-medium">ETA:</span> {data.estimatedArrival}
        </div>
      </div>

      {/* Map Visualization */}
      <div className={`relative h-48 ${themeClasses.map} rounded-lg mb-4 overflow-hidden`}>
        <div className="absolute inset-0 p-2">
          {/* Simplified Map Visualization */}
          <div className={`relative w-full h-full rounded border ${themeClasses.mapBorder}`}>
            {/* Origin Point */}
            <div 
              className="absolute top-1/2 left-[10%] transform -translate-y-1/2 cursor-pointer"
              onClick={() => openLocationModal(data.origin)}
              title="Click to view on Google Maps"
            >
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mb-1 hover:scale-150 transition-transform"></div>
                <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{data.origin.name}</span>
              </div>
            </div>

            {/* Destination Point */}
            <div 
              className="absolute top-1/2 right-[10%] transform -translate-y-1/2 cursor-pointer"
              onClick={() => openLocationModal(data.destination)}
              title="Click to view on Google Maps"
            >
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mb-1 hover:scale-150 transition-transform"></div>
                <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{data.destination.name}</span>
              </div>
            </div>

            {/* Progress Line */}
            <div className={`absolute top-1/2 left-[10%] right-[10%] h-1 ${themeClasses.timelineBg} transform -translate-y-1/2`}>
              <div 
                className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>

            {/* Current Location - Animated Ship */}
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 ease-out cursor-pointer"
              style={{ left: `${10 + progressPercentage * 0.8}%` }}
              onClick={() => openLocationModal(data.currentLocation)}
              title="Click to view on Google Maps"
            >
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full mb-1 animate-pulse hover:scale-125 transition-transform">
                  <Ship size={16} />
                </div>
                <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300 bg-gray-800' : 'text-gray-700 bg-white'} px-1 rounded`}>
                  {data.currentLocation.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carrier Information */}
      <div className={`mb-4 p-2 ${themeClasses.infoPanel} rounded-lg`}>
        <div className="flex justify-between">
          <div>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Carrier:</span>
            <span className="text-sm ml-1">{data.carrier}</span>
          </div>
          {data.vesselName && (
            <div>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Vessel:</span>
              <span className="text-sm ml-1">{data.vesselName}</span>
            </div>
          )}
        </div>
        {data.containerNumbers && data.containerNumbers.length > 0 && (
          <div className="mt-1">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Container:</span>
            <span className="text-sm ml-1">{data.containerNumbers.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Timeline Visualization */}
      <div className="relative">
        <div className={`absolute left-4 top-0 bottom-0 w-0.5 ${themeClasses.timelineBg}`}></div>
        {data.milestones.map((milestone, index) => (
          <div key={index} className="flex mb-4 relative">
            <div className="relative flex items-center justify-center ml-1 mr-3">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                  milestone.status === 'completed' ? 'bg-green-500 text-white' : 
                  milestone.status === 'inProgress' ? 'bg-blue-500 text-white' :
                  themeClasses.milestonePending
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
              <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{milestone.name}</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{milestone.date}</div>
              {milestone.location && (
                <div className={`text-xs flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
                  <MapPin size={12} className="mr-1" /> {milestone.location.name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Simplified Location Modal */}
      {showMap && selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${themeClasses.modal} rounded-lg shadow-lg w-full max-w-md flex flex-col`}>
            <div className={`flex justify-between items-center p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div>
                <h3 className="font-medium text-lg">{selectedLocation.name}</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </p>
              </div>
              <button 
                onClick={() => setShowMap(false)}
                className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} focus:outline-none`}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="mb-4 text-center">
                <MapPin size={48} className={`mx-auto ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'} mb-2`} />
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>View this location on Google Maps</p>
              </div>
              <button 
                onClick={() => openGoogleMapsInNewTab(selectedLocation)}
                className={`w-full px-4 py-3 ${themeClasses.buttonPrimary} rounded-md flex items-center justify-center space-x-2`}
              >
                <span>Open in Google Maps</span>
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentTracker; 