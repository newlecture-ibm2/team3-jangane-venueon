import { WireframeNav } from "../components/WireframeNav";
import { Link } from "react-router";
import { Calendar, Video, FileText, Users } from "lucide-react";

export function UserMyPage() {
  const upcomingSeminars = [
    {
      id: "1",
      title: "AI in Modern Business Strategy",
      date: "Apr 15, 2026",
      time: "2:00 PM",
      status: "upcoming",
      organizer: "Tech University",
    },
    {
      id: "3",
      title: "UX Design Fundamentals",
      date: "Apr 22, 2026",
      time: "3:00 PM",
      status: "upcoming",
      organizer: "Design Institute",
    },
  ];

  const ongoingSeminars = [
    {
      id: "2",
      title: "Advanced Financial Planning",
      date: "Mar 26, 2026",
      time: "10:00 AM",
      status: "ongoing",
      organizer: "Global Finance Corp",
    },
  ];

  const completedSeminars = [
    {
      id: "5",
      title: "Leadership in Tech Companies",
      date: "Mar 1, 2026",
      time: "9:00 AM",
      status: "completed",
      organizer: "Business School International",
    },
  ];

  const waitlistedSeminars = [
    {
      id: "6",
      title: "Data Science for Beginners",
      date: "May 5, 2026",
      time: "4:00 PM",
      status: "waitlisted",
      organizer: "Data Academy",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <WireframeNav />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 uppercase">My Page</h1>
          <p className="text-gray-700">Manage your seminar registrations and activity</p>
        </div>
        
        {/* Tabs */}
        <div className="mb-6 border-b-2 border-gray-400">
          <div className="flex gap-4">
            <button className="px-6 py-3 font-bold text-gray-900 border-b-4 border-gray-900">
              My Seminars
            </button>
            <button className="px-6 py-3 font-bold text-gray-600 hover:text-gray-900">
              Subscriptions
            </button>
            <button className="px-6 py-3 font-bold text-gray-600 hover:text-gray-900">
              Settings
            </button>
          </div>
        </div>
        
        {/* Upcoming Seminars */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase flex items-center gap-2">
            <Calendar size={24} />
            Upcoming Seminars
          </h2>
          
          <div className="space-y-3">
            {upcomingSeminars.map((seminar) => (
              <div 
                key={seminar.id}
                className="border-2 border-gray-600 bg-white p-4 flex items-center justify-between hover:border-gray-800 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{seminar.title}</h3>
                  <p className="text-sm text-gray-600">{seminar.organizer}</p>
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-medium">{seminar.date}</span> · {seminar.time}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-blue-100 border-2 border-blue-600 text-blue-900 font-bold text-sm">
                    UPCOMING
                  </span>
                  
                  <Link 
                    to={`/seminar/${seminar.id}`}
                    className="px-6 py-3 bg-gray-800 text-white font-bold hover:bg-gray-900 border-2 border-gray-900"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Ongoing Seminars */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase flex items-center gap-2">
            <Video size={24} />
            Ongoing Seminars
          </h2>
          
          <div className="space-y-3">
            {ongoingSeminars.map((seminar) => (
              <div 
                key={seminar.id}
                className="border-2 border-gray-800 bg-green-50 p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{seminar.title}</h3>
                  <p className="text-sm text-gray-600">{seminar.organizer}</p>
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-medium">{seminar.date}</span> · {seminar.time}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-green-600 border-2 border-green-800 text-white font-bold text-sm animate-pulse">
                    LIVE NOW
                  </span>
                  
                  <button className="px-8 py-3 bg-gray-800 text-white font-bold hover:bg-gray-900 border-2 border-gray-900 text-lg">
                    Enter Session →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Completed Seminars */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase flex items-center gap-2">
            <FileText size={24} />
            Completed Seminars
          </h2>
          
          <div className="space-y-3">
            {completedSeminars.map((seminar) => (
              <div 
                key={seminar.id}
                className="border-2 border-gray-500 bg-white p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{seminar.title}</h3>
                  <p className="text-sm text-gray-600">{seminar.organizer}</p>
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-medium">{seminar.date}</span> · {seminar.time}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-gray-300 border-2 border-gray-600 text-gray-800 font-bold text-sm">
                    COMPLETED
                  </span>
                  
                  <button className="px-6 py-3 bg-white border-2 border-gray-800 text-gray-800 font-bold hover:bg-gray-100">
                    Write Review
                  </button>
                  
                  <Link 
                    to={`/community/${seminar.id}`}
                    className="px-6 py-3 bg-gray-800 text-white font-bold hover:bg-gray-900 border-2 border-gray-900"
                  >
                    Community
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Waitlisted Seminars */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase flex items-center gap-2">
            <Users size={24} />
            Waitlisted Seminars
          </h2>
          
          <div className="space-y-3">
            {waitlistedSeminars.map((seminar) => (
              <div 
                key={seminar.id}
                className="border-2 border-gray-600 bg-yellow-50 p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{seminar.title}</h3>
                  <p className="text-sm text-gray-600">{seminar.organizer}</p>
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-medium">{seminar.date}</span> · {seminar.time}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-yellow-200 border-2 border-yellow-600 text-yellow-900 font-bold text-sm">
                    WAITLIST
                  </span>
                  
                  <button className="px-6 py-3 bg-white border-2 border-gray-600 text-gray-700 font-bold hover:bg-gray-100">
                    Cancel Waitlist
                  </button>
                  
                  <Link 
                    to={`/seminar/${seminar.id}`}
                    className="px-6 py-3 bg-gray-800 text-white font-bold hover:bg-gray-900 border-2 border-gray-900"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 border-2 border-gray-500 bg-white text-sm text-gray-700">
            [You'll receive an email notification if a spot becomes available for your waitlisted seminars]
          </div>
        </section>
      </div>
    </div>
  );
}
