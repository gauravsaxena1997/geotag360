import React, { useEffect, useState } from 'react';
import { TapConnectionRecord, TapStatus, User } from '../../types';
import { tapService } from '../../services/tapService';
import { Clock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

interface Props {
  user: User;
}

export const MySubmissions: React.FC<Props> = ({ user }) => {
  const [submissions, setSubmissions] = useState<TapConnectionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMySubmissions = async () => {
      try {
        const all = await tapService.getAll();
        const myRecords = all.filter(r => r.createdByUserId === user.id);
        setSubmissions(myRecords.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMySubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusIcon = (status: TapStatus) => {
    switch (status) {
      case TapStatus.APPROVED: return <CheckCircle2 className="text-green-500" size={20} />;
      case TapStatus.REJECTED: return <XCircle className="text-red-500" size={20} />;
      default: return <Clock className="text-yellow-500" size={20} />;
    }
  };

  const getStatusClass = (status: TapStatus) => {
    switch (status) {
      case TapStatus.APPROVED: return 'bg-green-50 text-green-700 border-green-200';
      case TapStatus.REJECTED: return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
          <p className="text-gray-500">Track the status of your FHTC uploads</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium text-gray-600">
          Total: {submissions.length}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
          <p className="text-gray-400">No submissions found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.photo1Url} alt="Evidence" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg font-semibold text-gray-900">{item.householdId}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center space-x-1 ${getStatusClass(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span>{item.status}</span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{item.village}, {item.block}</p>
                  <p className="text-xs text-gray-400 mt-1">Submitted: {new Date(item.capturedAt).toLocaleDateString()}</p>
                  
                  {item.status === TapStatus.REJECTED && (
                    <div className="mt-2 text-xs bg-red-50 text-red-600 p-2 rounded border border-red-100">
                      <strong>Rejected:</strong> {item.rejectionReason}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end">
                 <div className="hidden md:block text-right mr-4 text-sm text-gray-500">
                    <div>Lat: {item.latitude.toFixed(4)}</div>
                    <div>Long: {item.longitude.toFixed(4)}</div>
                 </div>
                 <ChevronRight className="text-gray-300" />
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};