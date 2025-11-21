import React, { useEffect, useState, useRef } from 'react';
import { tapService } from '../../services/tapService';
import { TapConnectionRecord, TapStatus } from '../../types';
import { Loader2, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Declare Leaflet global
declare const L: any;

export const MapView: React.FC = () => {
  const [points, setPoints] = useState<TapConnectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPipeline, setShowPipeline] = useState(true); // Default to showing the path
  const [includePending, setIncludePending] = useState(false); // New filter for pipeline
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const pipelineLayerRef = useRef<any>(null);
  const glowLayerRef = useRef<any>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    tapService.getAll().then((data) => {
      setPoints(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current || loading) return;

    // 1. Determine center
    // If we have points, center on the most recent one (or average), otherwise default to Jaipur
    let centerLat = 26.9124;
    let centerLng = 75.7873;

    if (points.length > 0) {
      const latSum = points.reduce((sum, p) => sum + p.latitude, 0);
      const lngSum = points.reduce((sum, p) => sum + p.longitude, 0);
      centerLat = latSum / points.length;
      centerLng = lngSum / points.length;
    }

    // 2. Initialize Map
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([centerLat, centerLng], 15);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);
    }

    // 3. Clear existing layers to redraw
    mapInstance.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapInstance.current.removeLayer(layer);
      }
    });

    // 4. Calculate Dynamic Pipeline Path
    // Logic: By default, only APPROVED records form the path.
    // If 'includePending' is checked, we add PENDING records to the path.
    // Rejected records are never part of the path.
    
    const pathPoints = points.filter(p => {
      if (p.status === TapStatus.APPROVED) return true;
      if (includePending && p.status === TapStatus.PENDING) return true;
      return false;
    }).sort((a, b) => 
      new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
    );
    
    const pipelineCoordinates = pathPoints.map(p => [p.latitude, p.longitude]);

    // --- Draw Pipeline Path ---
    if (showPipeline && pipelineCoordinates.length > 1) {
      glowLayerRef.current = L.polyline(pipelineCoordinates, {
        color: '#1d4ed8', // Darker Blue border/glow
        weight: 8,
        opacity: 0.4,
      }).addTo(mapInstance.current);

      pipelineLayerRef.current = L.polyline(pipelineCoordinates, {
        color: '#3b82f6', // Blue-500
        weight: 4,
        opacity: 1,
        lineJoin: 'round',
        dashArray: includePending ? '10, 10' : undefined // Dashed if it includes pending (optional visual cue)
      }).addTo(mapInstance.current);

      // Add tooltip to line
      pipelineLayerRef.current.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold text-blue-700">Supply Line Network</h3>
          <p class="text-xs text-gray-600">Connecting ${pathPoints.length} points.</p>
          <p class="text-xs text-gray-500 italic mt-1">
            ${includePending ? '(Includes Pending Verifications)' : '(Verified Connections Only)'}
          </p>
        </div>
      `);
    }

    // --- Draw Markers (All points are always visible as markers) ---
    points.forEach(p => {
      let color = 'yellow';
      if (p.status === TapStatus.APPROVED) color = 'green';
      if (p.status === TapStatus.REJECTED) color = 'red';

      // Create Marker
      const markerHtml = `<div style="background-color: ${color === 'green' ? '#22c55e' : color === 'red' ? '#ef4444' : '#eab308'}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`;
      
      const icon = L.divIcon({
        className: 'custom-marker',
        html: markerHtml,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        popupAnchor: [0, -10]
      });

      const marker = L.marker([p.latitude, p.longitude], { icon }).addTo(mapInstance.current);

      marker.bindPopup(`
        <div class="p-2 min-w-[180px]">
          <p class="font-bold text-sm text-gray-900">${p.householdId}</p>
          <p class="text-xs text-gray-600">${p.village}</p>
          <p class="text-xs font-bold mt-1 mb-2 ${color === 'green' ? 'text-green-600' : color === 'red' ? 'text-red-600' : 'text-yellow-600'}">${p.status}</p>
          <div class="flex flex-col space-y-2">
            <button id="btn-${p.id}" class="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 w-full transition-colors">View Details</button>
            <a href="https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}" target="_blank" rel="noopener noreferrer" class="text-xs text-blue-600 text-center hover:underline border border-blue-100 py-1 rounded bg-blue-50">Open in Google Maps</a>
          </div>
        </div>
      `);
      
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-${p.id}`);
        if (btn) {
          btn.onclick = () => navigate(`/admin/submissions/${p.id}`);
        }
      });
    });

    // Fit bounds to show all points
    if (points.length > 0) {
      const group = new L.FeatureGroup(
        points.map(p => L.marker([p.latitude, p.longitude]))
      );
      mapInstance.current.fitBounds(group.getBounds().pad(0.1));
    }

  }, [loading, points, navigate, showPipeline, includePending]);

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-300 relative overflow-hidden shadow-sm">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full z-10" />
      
      {/* Controls / Legend */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000] border border-gray-200 text-sm max-w-xs">
        <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">Map Controls</h3>
        
        {/* Toggle Pipeline Visibility */}
        <div className="mb-3">
          <label className="flex items-center cursor-pointer justify-between">
            <div className="flex items-center font-medium text-gray-700">
              <Layers size={16} className="mr-2 text-blue-600" />
              Show Pipeline
            </div>
            <div className="relative inline-block w-10 h-5 transition duration-200 ease-in-out">
              <input 
                type="checkbox" 
                className="peer absolute w-10 h-5 opacity-0 z-10 cursor-pointer"
                checked={showPipeline}
                onChange={() => setShowPipeline(!showPipeline)}
              />
              <div className="block bg-gray-200 w-full h-5 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
              <div className="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
            </div>
          </label>
        </div>

        {/* Filter Pipeline Points */}
        <div className={`mb-4 pl-6 transition-opacity duration-200 ${showPipeline ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <label className="flex items-center cursor-pointer space-x-2">
            <input 
              type="checkbox" 
              checked={includePending}
              onChange={(e) => setIncludePending(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-600 text-xs">Include Pending Requests</span>
          </label>
        </div>

        <h3 className="font-bold text-gray-700 mb-2 pt-2 border-t">Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center">
             <div className="w-8 h-1 bg-blue-500 rounded mr-2"></div>
             <span>Water Supply Path</span>
          </div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-sm mr-2"></div> Approved Tap</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-yellow-500 border border-white shadow-sm mr-2"></div> Pending Review</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm mr-2"></div> Rejected</div>
        </div>
      </div>
    </div>
  );
};