import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tapService } from '../../services/tapService';
import { TapConnectionRecord, TapStatus } from '../../types';
import { Filter, Search, Eye, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const SubmissionList: React.FC = () => {
  const [data, setData] = useState<TapConnectionRecord[]>([]);
  const [filteredData, setFilteredData] = useState<TapConnectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    tapService.getAll().then(res => {
      setData(res);
      setFilteredData(res);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = data;
    if (statusFilter !== 'ALL') {
      result = result.filter(r => r.status === statusFilter);
    }
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(r => 
        r.householdId.toLowerCase().includes(lower) || 
        r.village.toLowerCase().includes(lower) ||
        r.createdByName.toLowerCase().includes(lower)
      );
    }
    setFilteredData(result);
  }, [statusFilter, search, data]);

  const StatusBadge = ({ status }: { status: TapStatus }) => {
    const styles = {
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800'
    };
    const icons = {
      APPROVED: <CheckCircle2 size={14} className="mr-1" />,
      REJECTED: <XCircle size={14} className="mr-1" />,
      PENDING: <Clock size={14} className="mr-1" />
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Submissions Repository</h1>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search ID, Village..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400" size={18} />
            <select 
              className="p-2 border border-gray-300 rounded-lg outline-none bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value={TapStatus.PENDING}>Pending</option>
              <option value={TapStatus.APPROVED}>Approved</option>
              <option value={TapStatus.REJECTED}>Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-medium">
              <tr>
                <th className="px-6 py-4">Ref ID</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Field Worker</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                 <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading records...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No records found matching criteria.</td></tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600">{row.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{row.village}</div>
                      <div className="text-xs text-gray-500">{row.block}, {row.district}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{row.createdByName}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(row.capturedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/admin/submissions/${row.id}`}
                        className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
           <span>Showing {filteredData.length} records</span>
           <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};