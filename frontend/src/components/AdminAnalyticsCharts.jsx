import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

function AdminAnalyticsCharts({ analytics, categories }) {
  const chartCardStyle = {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '10px',
    padding: '20px',
    backdropFilter: 'blur(10px)',
    marginBottom: '20px'
  };

  const chartContainerStyle = {
    width: '100%',
    height: '280px'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '16px'
  };

  const chartDataTraffic = [
    { name: 'Authenticated', value: Math.max(0, (analytics?.totalVisitors || 0) - (analytics?.totalAnonymousVisitors || 0)) },
    { name: 'Anonymous', value: analytics?.totalAnonymousVisitors || 0 },
  ];

  const categoryChartData = Array.isArray(analytics?.categoryDistribution) && analytics.categoryDistribution.length > 0
    ? analytics.categoryDistribution
      .map((item) => ({
        name: item?.name || 'Uncategorized',
        value: Number(item?.value) || 0
      }))
      .filter((item) => item.value > 0)
    : (categories || []).map((c) => ({ name: c.name, value: 1 }));

  return (
    <div style={gridStyle}>
      <div style={chartCardStyle}>
        <h2>Traffic Flow</h2>
        <div style={chartContainerStyle}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartDataTraffic}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartDataTraffic.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={chartCardStyle}>
        <h2>Users & Activity</h2>
        <div style={chartContainerStyle}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{ name: 'Logins', value: analytics?.totalLogins || 0 }, { name: 'Users', value: analytics?.totalUsersCreated || 0 }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={chartCardStyle}>
        <h2>Photo Statistics</h2>
        <div style={chartContainerStyle}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{ name: 'Uploaded', value: analytics?.totalPhotosUploaded || 0 }, { name: 'Shared', value: analytics?.totalPhotosShared || 0 }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#FFBB28" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={chartCardStyle}>
        <h2>Category Distribution</h2>
        <div style={chartContainerStyle}>
          {categoryChartData.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
              No category data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`category-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminAnalyticsCharts;
