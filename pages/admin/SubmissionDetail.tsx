import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tapService } from '../../services/tapService';
import { TapConnectionRecord, TapStatus } from '../../types';
import { ArrowLeft, CheckCircle, XCircle, MapPin, Calendar, User, AlertCircle, ExternalLink } from 'lucide-react';

// Declare Leaflet global
declare const L: any;

export const SubmissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<TapConnectionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (id) {
      tapService.getAll().then(all => {
        const found = all.find(r => r.id === id);
        setRecord(found || null);
        setLoading(false);
      });
    }
  }, [id]);

  // Initialize Map when record is loaded
  useEffect(() => {
    if (!record || !mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current).setView([record.latitude, record.longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance.current);

    L.marker([record.latitude, record.longitude]).addTo(mapInstance.current)
      .bindPopup(`<b>${record.householdId}</b><br>${record.village}`)
      .openPopup();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [record]);

  const handleApprove = async () => {
    if (!record) return;
    setActionLoading(true);
    await tapService.updateStatus(record.id, TapStatus.APPROVED);
    setActionLoading(false);
    navigate('/admin/submissions');
  };

  const handleReject = async () => {
    if (!record) return;
    setActionLoading(true);
    await tapService.updateStatus(record.id, TapStatus.REJECTED, rejectionReason, 'Admin verification failed');
    setActionLoading(false);
    setRejectModalOpen(false);
    navigate('/admin/submissions');
  };

  if (loading) return <div className="p-10 text-center">Loading details...</div>;
  if (!record) return <div className="p-10 text-center">Record not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative pb-10">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900">
        <ArrowLeft size={18} className="mr-2" /> Back to List
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{record.householdId}</h1>
          <p className="text-gray-500">Submission ID: {record.id}</p>
        </div>
        <div className="flex gap-3">
          {record.status === TapStatus.PENDING && (
            <>
              <button 
                onClick={() => setRejectModalOpen(true)}
                disabled={actionLoading}
                className="px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 flex items-center"
              >
                <XCircle size={18} className="mr-2" /> Reject
              </button>
              <button 
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm flex items-center"
              >
                <CheckCircle size={18} className="mr-2" /> Approve
              </button>
            </>
          )}
          {record.status !== TapStatus.PENDING && (
             <span className={`px-4 py-2 rounded-lg border flex items-center font-medium ${
               record.status === TapStatus.APPROVED ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
             }`}>
               {record.status === TapStatus.APPROVED ? <CheckCircle size={18} className="mr-2"/> : <XCircle size={18} className="mr-2"/>}
               {record.status}
             </span>
          )}
        </div>
      </div>

      {record.status === TapStatus.REJECTED && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start space-x-3">
          <AlertCircle className="text-red-600 mt-0.5" size={20} />
          <div>
             <h4 className="font-semibold text-red-800">Rejection Details</h4>
             <p className="text-red-700 text-sm mt-1">{record.rejectionReason}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Photos */}
        <div className="space-y-6">
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold mb-3 text-gray-700">Tap Connection Evidence</h3>
              <div className="bg-gray-100 rounded-lg overflow-hidden aspect-video">
                 <img src={record.photo1Url} alt="Tap" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold mb-3 text-gray-700">Beneficiary Evidence</h3>
              <div className="bg-gray-100 rounded-lg overflow-hidden aspect-video">
                 <img src={record.photo2Url} alt="Beneficiary" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
           </div>
        </div>

        {/* Data & Map */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <h3 className="text-lg font-bold text-gray-900 mb-4">Metadata</h3>
             <div className="space-y-4">
               <div className="flex items-center">
                 <MapPin className="text-gray-400 mr-3" size={20} />
                 <div>
                   <p className="text-sm text-gray-500">Location</p>
                   <p className="font-medium">{record.village}, {record.block}, {record.district}</p>
                   <p className="text-xs text-gray-400 font-mono mt-1">{record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}</p>
                 </div>
               </div>
               <div className="flex items-center">
                 <User className="text-gray-400 mr-3" size={20} />
                 <div>
                   <p className="text-sm text-gray-500">Field Worker</p>
                   <p className="font-medium">{record.createdByName}</p>
                 </div>
               </div>
               <div className="flex items-center">
                 <Calendar className="text-gray-400 mr-3" size={20} />
                 <div>
                   <p className="text-sm text-gray-500">Captured At</p>
                   <p className="font-medium">{new Date(record.capturedAt).toLocaleString()}</p>
                 </div>
               </div>
             </div>
          </div>

          {/* Live Map */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-96 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700">Geo-Location Context</h3>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${record.latitude},${record.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-50 flex items-center transition-colors"
              >
                <ExternalLink size={12} className="mr-1" /> Open in Google Maps
              </a>
            </div>
            <div ref={mapRef} className="flex-1 rounded-lg border border-gray-200 z-10 relative" />
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Submission</h3>
            <p className="text-gray-500 mb-4">Please select a reason for rejecting this submission. This will be visible to the field worker.</p>
            
            <div className="space-y-3 mb-6">
               {['Image Unclear', 'Incorrect Location', 'Duplicate Entry', 'Household Not Found'].map(reason => (
                 <label key={reason} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                   <input 
                      type="radio" 
                      name="rejectReason" 
                      value={reason} 
                      checked={rejectionReason === reason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="mr-3"
                   />
                   {reason}
                 </label>
               ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleReject}
                disabled={!rejectionReason}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};