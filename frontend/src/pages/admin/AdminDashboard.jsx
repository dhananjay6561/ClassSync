import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { FiUsers, FiClipboard, FiAlertTriangle, FiArrowRight, FiInfo } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'];

const TooltipIcon = ({ text }) => (
  <div className="relative group">
    <FiInfo className="h-4 w-4 text-gray-400 cursor-pointer" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-3 bg-white text-gray-600 text-xs rounded-lg shadow-xl border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
      {text}
      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-white"></div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalSchedules: 0,
    pendingLeaves: 0,
    charts: {
      subjectsDistribution: {},
      weeklyLoad: {},
      leaveStatusDistribution: {},
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/dashboard/stats'); 
        setStats(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch admin statistics.');
        setStats({ 
          totalTeachers: 12, 
          totalSchedules: 150, 
          pendingLeaves: 3, 
          charts: {
            subjectsDistribution: { Math: 10, Science: 8, English: 12, History: 5 },
            weeklyLoad: { Mon: 30, Tue: 25, Wed: 35, Thu: 28, Fri: 32 },
            leaveStatusDistribution: { Pending: 3, Approved: 10, Rejected: 1 }
          }
        });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const leaveStatusData = Object.entries(stats.charts.leaveStatusDistribution || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <FiUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">Active teachers in the school</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scheduled Periods</CardTitle>
            <FiClipboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSchedules}</div>
            <p className="text-xs text-muted-foreground">Periods scheduled this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <FiAlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingLeaves || 0}</div>
             <Link to="/admin/manage-leaves" className="text-xs text-muted-foreground hover:underline">
              Review leave requests
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Weekly Load</CardTitle>
            <TooltipIcon text={
              <>
                <p className="font-bold mb-1">Weekly Load Distribution</p>
                <p>This graph shows the total number of periods scheduled for each day.</p>
                <p className="mt-2"><b>X-axis:</b> Day of the week</p>
                <p><b>Y-axis:</b> Number of scheduled periods</p>
              </>
            } />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(stats.charts.weeklyLoad || {}).map(([name, value]) => ({ name, value }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Subject Distribution</CardTitle>
            <TooltipIcon text={
              <>
                <p className="font-bold mb-1">Subject Period Distribution</p>
                <p>This graph shows the total number of periods assigned to each subject.</p>
                <p className="mt-2"><b>X-axis:</b> Subject name</p>
                <p><b>Y-axis:</b> Number of scheduled periods</p>
              </>
            } />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(stats.charts.subjectsDistribution || {}).map(([name, value]) => ({ name, value }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={70} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Leave Status</CardTitle>
            <TooltipIcon text={
              <>
                <p className="font-bold mb-1">Leave Request Status</p>
                <p>This chart shows the breakdown of all leave requests by their current status.</p>
              </>
            } />
          </CardHeader>
          <CardContent>
            {leaveStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leaveStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label
                  >
                    {leaveStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <p>No leave data to display.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard; 