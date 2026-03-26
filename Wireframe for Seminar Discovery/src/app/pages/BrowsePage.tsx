import { WireframeNav } from "../components/WireframeNav";
import { SeminarCard } from "../components/SeminarCard";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export function BrowsePage() {
  const [category, setCategory] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  
  const seminars = [
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
    {
      id: "5",
      title: "Leadership in Tech Companies",
      organizer: "Business School International",
      date: "May 1, 2026",
      time: "9:00 AM",
      price: "$79",
      location: "Boston, MA",
    },
    {
      id: "6",
      title: "Data Science for Beginners",
      organizer: "Data Academy",
      date: "May 5, 2026",
      time: "4:00 PM",
      price: "Free",
      location: "Online",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <WireframeNav />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 uppercase">Browse Seminars</h1>
        
        <div className="grid grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="col-span-1 space-y-4">
            <div className="border-2 border-gray-700 bg-white p-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-gray-300">
                <SlidersHorizontal size={20} className="text-gray-700" />
                <h2 className="font-bold text-gray-900 uppercase">Filters</h2>
              </div>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Search</label>
                <div className="flex items-center gap-2">
                  <Search size={18} className="text-gray-600" />
                  <input 
                    type="text"
                    placeholder="[Keyword]"
                    className="flex-1 px-3 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none text-sm"
                  />
                </div>
              </div>
              
              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="business">Business</option>
                  <option value="technology">Technology</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="finance">Finance</option>
                </select>
              </div>
              
              {/* Price */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Price</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input 
                      type="radio" 
                      name="price" 
                      value="all"
                      checked={priceFilter === "all"}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span>All</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input 
                      type="radio" 
                      name="price" 
                      value="free"
                      checked={priceFilter === "free"}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span>Free</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input 
                      type="radio" 
                      name="price" 
                      value="paid"
                      checked={priceFilter === "paid"}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span>Paid</span>
                  </label>
                </div>
              </div>
              
              {/* Date */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Date</label>
                <select 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none text-sm"
                >
                  <option value="all">Any Date</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="future">Future</option>
                </select>
              </div>
              
              <button className="w-full py-2 bg-gray-800 text-white font-bold hover:bg-gray-900 border-2 border-gray-900 text-sm">
                Apply Filters
              </button>
            </div>
          </aside>
          
          {/* Results */}
          <main className="col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-700">
                <span className="font-bold">{seminars.length} results</span> found
              </p>
              
              <select className="px-3 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none text-sm">
                <option>Sort by: Relevance</option>
                <option>Sort by: Date</option>
                <option>Sort by: Price (Low to High)</option>
                <option>Sort by: Price (High to Low)</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seminars.map((seminar) => (
                <SeminarCard key={seminar.id} {...seminar} />
              ))}
            </div>
            
            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <button className="px-4 py-2 border-2 border-gray-600 hover:border-gray-800 text-gray-700 font-medium">
                ← Prev
              </button>
              <button className="px-4 py-2 bg-gray-800 text-white font-bold border-2 border-gray-900">
                1
              </button>
              <button className="px-4 py-2 border-2 border-gray-600 hover:border-gray-800 text-gray-700 font-medium">
                2
              </button>
              <button className="px-4 py-2 border-2 border-gray-600 hover:border-gray-800 text-gray-700 font-medium">
                3
              </button>
              <button className="px-4 py-2 border-2 border-gray-600 hover:border-gray-800 text-gray-700 font-medium">
                Next →
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
