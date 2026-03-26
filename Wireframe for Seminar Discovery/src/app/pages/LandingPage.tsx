import { Link } from "react-router";
import { WireframeNav } from "../components/WireframeNav";
import { SeminarCard } from "../components/SeminarCard";
import { Search } from "lucide-react";

export function LandingPage() {
  const categories = ["Business", "Technology", "Design", "Marketing", "Finance", "Education"];
  
  const featuredSeminars = [
    {
      id: "1",
      title: "AI in Modern Business Strategy",
      organizer: "Tech University",
      date: "Apr 15, 2026",
      time: "2:00 PM",
      price: "Free",
      location: "Online",
    },
    {
      id: "2",
      title: "Advanced Financial Planning",
      organizer: "Global Finance Corp",
      date: "Apr 20, 2026",
      time: "10:00 AM",
      price: "$49",
      location: "New York, NY",
    },
    {
      id: "3",
      title: "UX Design Fundamentals",
      organizer: "Design Institute",
      date: "Apr 22, 2026",
      time: "3:00 PM",
      price: "$29",
      location: "Online",
    },
    {
      id: "4",
      title: "Digital Marketing Trends 2026",
      organizer: "Marketing Academy",
      date: "Apr 25, 2026",
      time: "1:00 PM",
      price: "Free",
      location: "San Francisco, CA",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <WireframeNav />
      
      {/* Hero Section */}
      <section className="bg-gray-200 border-b-4 border-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl mb-6 text-gray-900 uppercase tracking-tight">
            Discover Professional Seminars & Classes
          </h1>
          
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            [Subtitle text explaining the platform value proposition]
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link 
              to="/browse"
              className="px-8 py-4 bg-gray-800 text-white font-bold text-lg hover:bg-gray-900 border-2 border-gray-900"
            >
              Browse Seminars
            </Link>
            
            <Link 
              to="/org/dashboard"
              className="px-8 py-4 bg-white border-2 border-gray-800 text-gray-800 font-bold text-lg hover:bg-gray-100"
            >
              Host a Seminar
              <span className="text-sm ml-2 text-gray-600">(for organizations)</span>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Search & Categories */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="border-2 border-gray-700 bg-white p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Search className="text-gray-600" size={24} />
            <input 
              type="text"
              placeholder="[Search seminars by keyword, topic, or organization]"
              className="flex-1 px-4 py-3 border-2 border-gray-400 focus:border-gray-700 outline-none text-gray-700"
            />
            <button className="px-6 py-3 bg-gray-800 text-white font-bold hover:bg-gray-900 border-2 border-gray-900">
              Search
            </button>
          </div>
          
          <div className="border-t-2 border-gray-300 pt-4">
            <p className="text-sm text-gray-600 mb-3 uppercase tracking-wide">Categories:</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button 
                  key={category}
                  className="px-4 py-2 border-2 border-gray-600 hover:border-gray-800 hover:bg-gray-100 text-gray-700 text-sm font-medium"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Seminars */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 uppercase">Featured Seminars</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredSeminars.map((seminar) => (
            <SeminarCard key={seminar.id} {...seminar} />
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Link 
            to="/browse"
            className="inline-block px-8 py-3 border-2 border-gray-800 text-gray-800 font-bold hover:bg-gray-100"
          >
            View All Seminars →
          </Link>
        </div>
      </section>
    </div>
  );
}
