import React, { useEffect, useState } from 'react';
import { tapService } from '../../services/tapService';
import { TapConnectionRecord, TapStatus } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CheckCircle, Clock, XCircle, Map, Users } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [recent, setRecent] = useState<TapConnectionRecord[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await tapService.getAll();
      setStats({
        total: data.length,
        pending: data.filter(d => d.status === TapStatus.PENDING).length,
        approved: data.filter(d => d.status === TapStatus.APPROVED).length,
        rejected: data.filter(d => d.status === TapStatus.REJECTED).length,
      });
      setRecent(data.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()).slice(0, 5));
    };
    loadData();
  }, []);

  const chartData = [
    { name: 'Approved', value: stats.approved, color: '#22c55e' },
    { name: 'Pending', value: stats.pending, color: '#eab308' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
  ];

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="text-white" size={24} />
        </div>
        <span className="text-3xl font-bold text-gray-800">{value}</span>
      </div>
      <h3 className="text-gray-500 font-medium">{title}</h3>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500">Monitoring FHTC progress across districts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Connections" value={stats.total} icon={Users} color="bg-blue-600" />
        <StatCard title="Approved" value={stats.approved} icon={CheckCircle} color="bg-green-500" />
        <StatCard title="Pending Review" value={stats.pending} icon={Clock} color="bg-yellow-500" />
        <StatCard title="Rejected" value={stats.rejected} icon={XCircle} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Status Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" barSize={30} radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Submissions</h3>
          <div className="space-y-4">
            {recent.map(item => (
              <div key={item.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition">
                <div className="w-10 h-10 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                  <img src={item.photo1Url} className="w-full h-full object-cover" alt="t" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.householdId}</p>
                  <p className="text-xs text-gray-500 truncate">{item.village}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  item.status === 'APPROVED' ? 'bg-green-500' : 
                  item.status === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};