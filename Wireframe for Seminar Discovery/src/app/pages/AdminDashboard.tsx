import { WireframeNav } from "../components/WireframeNav";
import { Users, Calendar, AlertTriangle, Activity, Ban, Trash2, Eye } from "lucide-react";

export function AdminDashboard() {
  const recentReports = [
    {
      id: "1",
      type: "Post",
      content: "Inappropriate content in community post",
      reporter: "user_123",
      reported: "user_456",
      date: "Mar 26, 2026",
      status: "pending",
    },
    {
      id: "2",
      type: "Seminar",
      content: "Misleading seminar information",
      reporter: "user_789",
      reported: "org_xyz",
      date: "Mar 25, 2026",
      status: "pending",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <WireframeNav />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 uppercase">Admin Dashboard</h1>
          <p className="text-gray-700">Platform management and oversight</p>
        </div>
        
        {/* Platform Overview Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="border-2 border-gray-600 bg-white p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 uppercase">Total Users</p>
              <Users size={24} className="text-gray-600" />
            </div>
            <p className="text-4xl font-bold text-gray-900">12,458</p>
            <p className="text-xs text-green-700 mt-1">↑ 8.5% from last month</p>
          </div>
          
          <div className="border-2 border-gray-600 bg-white p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 uppercase">Total Seminars</p>
              <Calendar size={24} className="text-gray-600" />
            </div>
            <p className="text-4xl font-bold text-gray-900">1,245</p>
            <p className="text-xs text-green-700 mt-1">↑ 12.3% from last month</p>
          </div>
          
          <div className="border-2 border-gray-600 bg-white p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 uppercase">Active Reports</p>
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <p className="text-4xl font-bold text-gray-900">8</p>
            <p className="text-xs text-red-700 mt-1">Requires attention</p>
          </div>
          
          <div className="border-2 border-gray-600 bg-white p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 uppercase">Activity Today</p>
              <Activity size={24} className="text-gray-600" />
            </div>
            <p className="text-4xl font-bold text-gray-900">3,421</p>
            <p className="text-xs text-gray-600 mt-1">Active sessions</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-6 border-b-2 border-gray-400">
          <div className="flex gap-4">
            <button className="px-6 py-3 font-bold text-gray-900 border-b-4 border-gray-900">
              Overview
            </button>
            <button className="px-6 py-3 font-bold text-gray-600 hover:text-gray-900">
              Seminar Control
            </button>
            <button className="px-6 py-3 font-bold text-gray-600 hover:text-gray-900">
              User Management
            </button>
            <button className="px-6 py-3 font-bold text-gray-600 hover:text-gray-900 flex items-center gap-2">
              Reports
              <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">8</span>
            </button>
            <button className="px-6 py-3 font-bold text-gray-600 hover:text-gray-900">
              Analytics
            </button>
          </div>
        </div>
        
        {/* Recent Reports */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase flex items-center gap-2">
            <AlertTriangle size={24} className="text-red-600" />
            Recent Reports
          </h2>
          
          <div className="border-2 border-gray-700 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-400 bg-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">Content</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">Reporter</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">Reported</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => (
                  <tr key={report.id} className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700 font-mono text-sm">#{report.id}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-200 border border-gray-500 text-gray-800 text-xs font-bold">
                        {report.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{report.content}</td>
                    <td className="py-3 px-4 text-gray-700 font-mono text-sm">{report.reporter}</td>
                    <td className="py-3 px-4 text-gray-700 font-mono text-sm">{report.reported}</td>
                    <td className="py-3 px-4 text-gray-700">{report.date}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-yellow-200 border border-yellow-600 text-yellow-900 text-xs font-bold">
                        {report.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 border-2 border-gray-600 hover:border-gray-800" title="View Details">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 border-2 border-red-600 text-red-700 hover:bg-red-50" title="Take Action">
                          <Ban size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="p-4 text-center border-t-2 border-gray-300">
              <button className="px-6 py-2 border-2 border-gray-700 text-gray-800 font-bold hover:bg-gray-100">
                View All Reports
              </button>
            </div>
          </div>
        </section>
        
        {/* Seminar Control */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase">Seminar Control</h2>
          
          <div className="border-2 border-gray-700 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <input 
                  type="text"
                  placeholder="[Search seminars by title or organizer]"
                  className="px-4 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none w-96"
                />
                <select className="px-4 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none">
                  <option>All Status</option>
                  <option>Published</option>
                  <option>Flagged</option>
                  <option>Suspended</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { title: "Advanced Financial Planning", org: "Global Finance Corp", attendees: 78, status: "published" },
                { title: "UX Design Fundamentals", org: "Design Institute", attendees: 45, status: "published" },
                { title: "Digital Marketing Trends", org: "Marketing Academy", attendees: 23, status: "flagged" },
              ].map((seminar, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-4 border-2 border-gray-600 hover:border-gray-800"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{seminar.title}</h3>
                    <p className="text-sm text-gray-600">by {seminar.org} · {seminar.attendees} attendees</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-bold border-2 ${
                      seminar.status === "published"
                        ? "bg-green-100 border-green-600 text-green-900"
                        : "bg-red-100 border-red-600 text-red-900"
                    }`}>
                      {seminar.status.toUpperCase()}
                    </span>
                    
                    <button className="px-4 py-2 border-2 border-gray-600 text-gray-700 font-bold hover:border-gray-800 text-sm">
                      <Eye size={16} className="inline mr-1" />
                      View
                    </button>
                    
                    <button className="px-4 py-2 border-2 border-yellow-600 text-yellow-800 font-bold hover:bg-yellow-50 text-sm">
                      <Ban size={16} className="inline mr-1" />
                      Suspend
                    </button>
                    
                    <button className="px-4 py-2 border-2 border-red-600 text-red-700 font-bold hover:bg-red-50 text-sm">
                      <Trash2 size={16} className="inline mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* User Management */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase">User Management</h2>
          
          <div className="border-2 border-gray-700 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <input 
                  type="text"
                  placeholder="[Search users by name, email, or ID]"
                  className="px-4 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none w-96"
                />
                <select className="px-4 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none">
                  <option>All Users</option>
                  <option>Attendees</option>
                  <option>Organizations</option>
                  <option>Suspended</option>
                </select>
              </div>
            </div>
            
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-400">
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">User ID</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "user_123", name: "John Smith", email: "john@example.com", type: "Attendee", joined: "Jan 2026", status: "active" },
                  { id: "org_xyz", name: "Tech University", email: "contact@tech.edu", type: "Organization", joined: "Dec 2025", status: "active" },
                  { id: "user_456", name: "Sarah Chen", email: "sarah@example.com", type: "Attendee", joined: "Feb 2026", status: "active" },
                ].map((user) => (
                  <tr key={user.id} className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700 font-mono text-sm">{user.id}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">{user.name}</td>
                    <td className="py-3 px-4 text-gray-700">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-bold border ${
                        user.type === "Organization"
                          ? "bg-blue-100 border-blue-600 text-blue-900"
                          : "bg-gray-200 border-gray-500 text-gray-800"
                      }`}>
                        {user.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{user.joined}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-100 border border-green-600 text-green-900 text-xs font-bold">
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 border-2 border-gray-600 hover:border-gray-800" title="View Profile">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 border-2 border-red-600 text-red-700 hover:bg-red-50" title="Suspend User">
                          <Ban size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">Showing 3 of 12,458 users</p>
              <button className="px-6 py-2 border-2 border-gray-700 text-gray-800 font-bold hover:bg-gray-100">
                Load More
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
