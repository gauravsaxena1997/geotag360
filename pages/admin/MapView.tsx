import React, { useEffect, useState, useRef } from 'react';
import { tapService } from '../../services/tapService';
import { TapConnectionRecord, TapStatus } from '../../types';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Declare Leaflet global
declare const L: any;

export const MapView: React.FC = () => {
  const [points, setPoints] = useState<TapConnectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    tapService.getAll().then((data) => {
      setPoints(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current || loading || !points.length) return;

    // Determine center (average of points or default to Jaipur)
    const centerLat = points.length > 0 
      ? points.reduce((sum, p) => sum + p.latitude, 0) / points.length 
      : 26.9124;
    const centerLng = points.length > 0 
      ? points.reduce((sum, p) => sum + p.longitude, 0) / points.length 
      : 75.7873;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([centerLat, centerLng], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);
    }

    // Clear existing layers if any (though we only init once here)
    mapInstance.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        mapInstance.current.removeLayer(layer);
      }
    });

    // Add markers
    points.forEach(p => {
      let color = 'yellow';
      if (p.status === TapStatus.APPROVED) color = 'green';
      if (p.status === TapStatus.REJECTED) color = 'red';

      // Create a custom colored icon using DivIcon for better control
      const markerHtml = `<div style="background-color: ${color === 'green' ? '#22c55e' : color === 'red' ? '#ef4444' : '#eab308'}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`;
      
      const icon = L.divIcon({
        className: 'custom-marker',
        html: markerHtml,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
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
      
      // Handle click inside popup
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-${p.id}`);
        if (btn) {
          btn.onclick = () => navigate(`/admin/submissions/${p.id}`);
        }
      });
    });

    // Fit bounds if points exist
    if (points.length > 0) {
      const group = new L.FeatureGroup(points.map(p => L.marker([p.latitude, p.longitude])));
      mapInstance.current.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [loading, points, navigate]);

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-300 relative overflow-hidden shadow-sm">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full z-10" />
      
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000] border border-gray-200 text-sm">
        <h3 className="font-bold text-gray-700 mb-2">Legend</h3>
        <div className="space-y-1">
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-sm mr-2"></div> Approved</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-yellow-500 border border-white shadow-sm mr-2"></div> Pending</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm mr-2"></div> Rejected</div>
        </div>
      </div>
    </div>
  );
};