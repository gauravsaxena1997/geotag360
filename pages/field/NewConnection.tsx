import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';
import { tapService } from '../../services/tapService';
import { Camera, MapPin, Upload, X, CheckCircle, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';

// Declare Leaflet global
declare const L: any;

interface Props {
  user: User;
}

export const NewConnection: React.FC<Props> = ({ user }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    householdId: '',
    village: '',
    block: user.block || '',
    district: user.district || '',
    latitude: 0,
    longitude: 0,
  });

  const [images, setImages] = useState<{ photo1: File | null, photo2: File | null }>({
    photo1: null,
    photo2: null
  });

  const [previews, setPreviews] = useState<{ photo1: string, photo2: string }>({
    photo1: '',
    photo2: ''
  });

  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // Map refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: 'photo1' | 'photo2') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImages(prev => ({ ...prev, [key]: file }));
      setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
    }
  };

  const captureLocation = () => {
    setLocationStatus('loading');
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setLocationStatus('success');
      },
      (error) => {
        console.error(error);
        setLocationStatus('error');
        // alert('Unable to retrieve your location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Initialize Map Preview when location is captured
  useEffect(() => {
    if (locationStatus === 'success' && form.latitude !== 0 && form.longitude !== 0 && mapRef.current) {
      if (!mapInstance.current) {
        // Init map
        mapInstance.current = L.map(mapRef.current, {
          center: [form.latitude, form.longitude],
          zoom: 16,
          zoomControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(mapInstance.current);

        L.marker([form.latitude, form.longitude]).addTo(mapInstance.current)
          .bindPopup("Captured Location")
          .openPopup();
      } else {
        // Update map
        mapInstance.current.setView([form.latitude, form.longitude], 16);
        
        // Clear existing markers
        mapInstance.current.eachLayer((layer: any) => {
          if (layer instanceof L.Marker) {
            mapInstance.current.removeLayer(layer);
          }
        });

        L.marker([form.latitude, form.longitude]).addTo(mapInstance.current)
          .bindPopup("Updated Location")
          .openPopup();
      }
    }
  }, [locationStatus, form.latitude, form.longitude]);

  // Helper to convert file to base64 for local storage persistence
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!images.photo1 || !images.photo2) {
      alert("Both photos are required.");
      return;
    }
    if (form.latitude === 0) {
      alert("Location capture is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert images to Base64 so they persist in localStorage
      const photo1Url = await fileToBase64(images.photo1);
      const photo2Url = await fileToBase64(images.photo2);

      await tapService.create({
        ...form,
        photo1Url,
        photo2Url,
        createdByUserId: user.id,
        createdByName: user.name,
      });

      navigate('/submissions');
    } catch (error) {
      console.error(error);
      alert("Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Tap Connection</h1>
        <p className="text-gray-500">Capture evidence and location for FHTC</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <MapPin className="mr-2 text-blue-600" size={20} />
            Geo-Tagging
          </h2>
          
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-blue-50 p-4 rounded-lg mb-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Current Coordinates</p>
              <div className="text-lg font-mono text-blue-800">
                {form.latitude !== 0 ? (
                  `${form.latitude.toFixed(6)}, ${form.longitude.toFixed(6)}`
                ) : (
                  <span className="text-gray-400">Not captured yet</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={captureLocation}
              disabled={locationStatus === 'loading'}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors w-full md:w-auto justify-center ${
                locationStatus === 'success' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {locationStatus === 'loading' ? (
                <Loader2 className="animate-spin" size={18} />
              ) : locationStatus === 'success' ? (
                <>
                  <CheckCircle size={18} />
                  <span>Recapture</span>
                </>
              ) : (
                <>
                  <MapPin size={18} />
                  <span>Capture Location</span>
                </>
              )}
            </button>
          </div>

          {/* Map Preview */}
          {locationStatus === 'success' && (
            <>
              <div className="h-48 w-full rounded-lg border border-blue-200 overflow-hidden relative z-0">
                 <div ref={mapRef} className="w-full h-full" />
              </div>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${form.latitude},${form.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center mt-3 justify-end"
              >
                <ExternalLink size={14} className="mr-1" /> Verify on Google Maps
              </a>
            </>
          )}

          {locationStatus === 'error' && (
            <p className="text-red-500 text-sm flex items-center mt-2">
              <AlertTriangle size={14} className="mr-1" />
              Unable to retrieve location. Ensure GPS is enabled.
            </p>
          )}
        </div>

        {/* Details Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Beneficiary Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Household ID</label>
              <input
                type="text"
                name="householdId"
                value={form.householdId}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g., HH-1001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
              <input
                type="text"
                name="village"
                value={form.village}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Village Name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Block</label>
              <input
                type="text"
                name="block"
                value={form.block}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-600 cursor-not-allowed"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <input
                type="text"
                name="district"
                value={form.district}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-600 cursor-not-allowed"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Photos Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <Camera className="mr-2 text-blue-600" size={20} />
            Photographic Evidence
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Photo 1 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tap Connection Photo</label>
              <div className={`relative h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors ${previews.photo1 ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'}`}>
                {previews.photo1 ? (
                  <>
                    <img src={previews.photo1} alt="Preview 1" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => {
                        setImages(prev => ({...prev, photo1: null}));
                        setPreviews(prev => ({...prev, photo1: ''}));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                    <Camera className="text-gray-400 mb-2" size={32} />
                    <span className="text-sm text-gray-500">Click to capture</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      className="hidden" 
                      onChange={(e) => handleFileChange(e, 'photo1')}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Photo 2 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Beneficiary with Tap</label>
              <div className={`relative h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors ${previews.photo2 ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'}`}>
                {previews.photo2 ? (
                  <>
                    <img src={previews.photo2} alt="Preview 2" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => {
                        setImages(prev => ({...prev, photo2: null}));
                        setPreviews(prev => ({...prev, photo2: ''}));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                    <Upload className="text-gray-400 mb-2" size={32} />
                    <span className="text-sm text-gray-500">Click to upload</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileChange(e, 'photo2')}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-end space-x-4 pb-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-lg flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Submitting...
              </>
            ) : (
              'Submit Record'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};