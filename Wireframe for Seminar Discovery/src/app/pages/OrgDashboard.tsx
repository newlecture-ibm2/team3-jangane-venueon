import { WireframeNav } from "../components/WireframeNav";
import { Link } from "react-router";
import { Plus, Edit2, Trash2, Users, MessageSquare, Calendar } from "lucide-react";

export function OrgDashboard() {
  const seminars = [
    {
      id: "1",
      title: "AI in Modern Business Strategy",
      status: "published",
      attendees: 45,
      capacity: 100,
      date: "Apr 15, 2026",
      revenue: "$0 (Free)",
    },
    {
      id: "2",
      title: "Advanced Financial Planning",
      status: "published",
      attendees: 78,
      capacity: 80,
      date: "Apr 20, 2026",
      revenue: "$3,822",
    },
    {
      id: "3",
      title: "Marketing Workshop Series",
      status: "draft",
      attendees: 0,
      capacity: 50,
      date: "May 1, 2026",
      revenue: "$0",
    },
    {
      id: "4",
      title: "Leadership Summit 2026",
      status: "ended",
      attendees: 120,
      capacity: 120,
      date: "Mar 10, 2026",
      revenue: "$9,480",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <WireframeNav />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 uppercase">Organization Dashboard</h1>
            <p className="text-gray-700">Manage your seminars and attendees</p>
          </div>
          
          <Link 
            to="/org/create-seminar"
            className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white font-bold hover:bg-gray-900 border-2 border-gray-900"
          >
            <Plus size={20} />
            Create New Seminar
          </Link>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="border-2 border-gray-600 bg-white p-6">
            <p className="text-sm text-gray-600 uppercase mb-1">Total Seminars</p>
            <p className="text-4xl font-bold text-gray-900">4</p>
          </div>
          
          <div className="border-2 border-gray-600 bg-white p-6">
            <p className="text-sm text-gray-600 uppercase mb-1">Total Attendees</p>
            <p className="text-4xl font-bold text-gray-900">243</p>
          </div>
          
          <div className="border-2 border-gray-600 bg-white p-6">
            <p className="text-sm text-gray-600 uppercase mb-1">Active Events</p>
            <p className="text-4xl font-bold text-gray-900">2</p>
          </div>
          
          <div className="border-2 border-gray-600 bg-white p-6">
            <p className="text-sm text-gray-600 uppercase mb-1">Total Revenue</p>
            <p className="text-4xl font-bold text-gray-900">$13.3K</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-6 border-b-2 border-gray-400">
          <div className="flex gap-4">
            <button className="px-6 py-3 font-bold text-gray-900 border-b-4 border-gray-900">
              Seminar Management
            </button>
            <button className="px-6 py-3 font-bold text-gray-600 hover:text-gray-900">
              Participants
            </button>
            <button className="px-6 py-3 font-bold text-gray-600 hover:text-gray-900">
              Community
            </button>
            <button className="px-6 py-3 font-bold text-gray-600 hover:text-gray-900">
              Analytics
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="mb-6 flex items-center gap-4">
          <select className="px-4 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none font-medium">
            <option>All Status</option>
            <option>Published</option>
            <option>Draft</option>
            <option>Ended</option>
          </select>
          
          <select className="px-4 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none font-medium">
            <option>Sort by: Date</option>
            <option>Sort by: Attendees</option>
            <option>Sort by: Revenue</option>
          </select>
        </div>
        
        {/* Seminars List */}
        <div className="space-y-4">
          {seminars.map((seminar) => (
            <div 
              key={seminar.id}
              className="border-2 border-gray-600 bg-white p-6 hover:border-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 text-xl">{seminar.title}</h3>
                    
                    <span className={`px-3 py-1 text-xs font-bold border-2 ${
                      seminar.status === "published" 
                        ? "bg-green-100 border-green-600 text-green-900"
                        : seminar.status === "draft"
                        ? "bg-yellow-100 border-yellow-600 text-yellow-900"
                        : "bg-gray-300 border-gray-600 text-gray-800"
                    }`}>
                      {seminar.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-6 mt-4">
                    <div>
                      <p className="text-sm text-gray-600 uppercase mb-1">Date</p>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-600" />
                        <p className="font-medium text-gray-900">{seminar.date}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 uppercase mb-1">Attendees</p>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-600" />
                        <p className="font-medium text-gray-900">
                          {seminar.attendees} / {seminar.capacity}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 uppercase mb-1">Revenue</p>
                      <p className="font-bold text-gray-900">{seminar.revenue}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 uppercase mb-1">Capacity</p>
                      <div className="w-full bg-gray-300 h-2 border border-gray-500 mt-2">
                        <div 
                          className="bg-gray-800 h-full"
                          style={{ width: `${(seminar.attendees / seminar.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-6">
                  <Link
                    to={`/seminar/${seminar.id}`}
                    className="px-4 py-2 border-2 border-gray-600 text-gray-700 font-bold hover:border-gray-800 text-sm"
                  >
                    View
                  </Link>
                  
                  <button className="px-4 py-2 border-2 border-gray-600 text-gray-700 font-bold hover:border-gray-800 flex items-center gap-2 text-sm">
                    <Edit2 size={16} />
                    Edit
                  </button>
                  
                  <button className="px-4 py-2 border-2 border-gray-600 text-gray-700 font-bold hover:border-gray-800 flex items-center gap-2 text-sm">
                    <Users size={16} />
                    Participants
                  </button>
                  
                  <button className="px-4 py-2 border-2 border-gray-600 text-gray-700 font-bold hover:border-gray-800 flex items-center gap-2 text-sm">
                    <MessageSquare size={16} />
                    Community
                  </button>
                  
                  <button className="px-4 py-2 border-2 border-red-600 text-red-700 font-bold hover:bg-red-50 flex items-center gap-2 text-sm">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Participants Management Preview */}
        <div className="mt-12 border-2 border-gray-700 bg-white p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase">Recent Participants</h2>
          
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-400">
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">Name</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">Email</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">Seminar</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">Registered</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "John Smith", email: "john@example.com", seminar: "AI Strategy", status: "Paid", date: "Mar 20, 2026" },
                { name: "Sarah Johnson", email: "sarah@example.com", seminar: "Financial Planning", status: "Paid", date: "Mar 22, 2026" },
                { name: "Mike Chen", email: "mike@example.com", seminar: "AI Strategy", status: "Free", date: "Mar 24, 2026" },
              ].map((participant, idx) => (
                <tr key={idx} className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 font-medium">{participant.name}</td>
                  <td className="py-3 px-4 text-gray-700">{participant.email}</td>
                  <td className="py-3 px-4 text-gray-700">{participant.seminar}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-bold ${
                      participant.status === "Paid"
                        ? "bg-green-100 border border-green-600 text-green-900"
                        : "bg-blue-100 border border-blue-600 text-blue-900"
                    }`}>
                      {participant.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{participant.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-4 text-center">
            <button className="px-6 py-2 border-2 border-gray-700 text-gray-800 font-bold hover:bg-gray-100">
              View All Participants
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
