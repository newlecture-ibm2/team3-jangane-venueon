import { WireframeNav } from "../components/WireframeNav";
import { useParams, Link } from "react-router";
import { Calendar, MapPin, DollarSign, Users, Clock, Building } from "lucide-react";
import { useState } from "react";

export function SeminarDetailPage() {
  const { id } = useParams();
  const [ticketQuantity, setTicketQuantity] = useState(1);
  
  // Demo state - change to see different UI states
  const [seminarState, setSeminarState] = useState<"available" | "soldout" | "registered" | "ended">("available");

  return (
    <div className="min-h-screen bg-gray-50">
      <WireframeNav />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Main Content */}
          <main className="col-span-2 space-y-6">
            {/* Thumbnail */}
            <div className="bg-gray-300 border-2 border-gray-600 h-96 flex items-center justify-center text-gray-600 text-xl">
              [Seminar Thumbnail Image]
            </div>
            
            {/* Title & Organizer */}
            <div className="border-2 border-gray-700 bg-white p-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">AI in Modern Business Strategy</h1>
              
              <div className="flex items-center gap-4 pb-4 border-b-2 border-gray-300">
                <div className="w-16 h-16 bg-gray-300 border-2 border-gray-600 flex items-center justify-center text-xs">
                  [Logo]
                </div>
                <div>
                  <p className="text-sm text-gray-600 uppercase">Organized by</p>
                  <p className="font-bold text-gray-900 text-lg">Tech University</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3">
                  <Calendar className="text-gray-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600 uppercase">Date & Time</p>
                    <p className="font-bold text-gray-900">April 15, 2026</p>
                    <p className="text-gray-700">2:00 PM - 5:00 PM</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="text-gray-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600 uppercase">Location</p>
                    <p className="font-bold text-gray-900">Online</p>
                    <p className="text-gray-700">Zoom Meeting Link</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <DollarSign className="text-gray-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600 uppercase">Price</p>
                    <p className="font-bold text-gray-900 text-xl">Free</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="text-gray-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600 uppercase">Seats Available</p>
                    <p className="font-bold text-gray-900">45 / 100</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="border-2 border-gray-700 bg-white p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3 uppercase">Description</h2>
              <div className="text-gray-700 space-y-3">
                <p>[Full seminar description paragraph explaining the content, objectives, and what attendees will learn.]</p>
                <p>[Additional details about prerequisites, target audience, and expected outcomes.]</p>
                <p>[More information about certification, materials provided, or follow-up resources.]</p>
              </div>
            </div>
            
            {/* Session Breakdown */}
            <div className="border-2 border-gray-700 bg-white p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase">Session Breakdown</h2>
              
              <div className="space-y-3">
                {[
                  { time: "2:00 - 2:30 PM", title: "Introduction to AI Concepts" },
                  { time: "2:30 - 3:15 PM", title: "AI Applications in Business" },
                  { time: "3:15 - 3:30 PM", title: "Break" },
                  { time: "3:30 - 4:30 PM", title: "Case Studies & Examples" },
                  { time: "4:30 - 5:00 PM", title: "Q&A Session" },
                ].map((session, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border-2 border-gray-400">
                    <Clock size={18} className="text-gray-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">{session.time}</p>
                      <p className="font-bold text-gray-900">{session.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Organizer Info */}
            <div className="border-2 border-gray-700 bg-white p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3 uppercase">About the Organizer</h2>
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-300 border-2 border-gray-600 flex items-center justify-center text-xs flex-shrink-0">
                  [Org Logo]
                </div>
                <div className="text-gray-700">
                  <p className="font-bold text-gray-900 text-lg mb-2">Tech University</p>
                  <p>[Organization description, credentials, and background information explaining their expertise and authority in this subject.]</p>
                </div>
              </div>
            </div>
          </main>
          
          {/* Sticky Sidebar - Registration */}
          <aside className="col-span-1">
            <div className="sticky top-8 border-2 border-gray-800 bg-white p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 uppercase">Register</h3>
              
              {/* State Selector (for demo) */}
              <div className="mb-4 p-3 bg-gray-100 border-2 border-gray-400">
                <p className="text-xs uppercase mb-2 text-gray-600">Demo: View State</p>
                <select 
                  value={seminarState}
                  onChange={(e) => setSeminarState(e.target.value as any)}
                  className="w-full px-2 py-1 border-2 border-gray-600 text-sm"
                >
                  <option value="available">Available</option>
                  <option value="soldout">Sold Out</option>
                  <option value="registered">Already Registered</option>
                  <option value="ended">Event Ended</option>
                </select>
              </div>
              
              {/* Available State */}
              {seminarState === "available" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                      Tickets
                    </label>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                        className="w-10 h-10 border-2 border-gray-700 font-bold text-xl hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-bold text-2xl">{ticketQuantity}</span>
                      <button 
                        onClick={() => setTicketQuantity(ticketQuantity + 1)}
                        className="w-10 h-10 border-2 border-gray-700 font-bold text-xl hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-6 p-4 border-2 border-gray-400 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Subtotal:</span>
                      <span className="font-bold text-gray-900 text-xl">Free</span>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/register/${id}`}
                    className="block w-full py-4 bg-gray-800 text-white font-bold text-center hover:bg-gray-900 border-2 border-gray-900 text-lg"
                  >
                    Register Now
                  </Link>
                  
                  <p className="text-xs text-gray-600 mt-3 text-center">
                    [Terms and conditions apply]
                  </p>
                </>
              )}
              
              {/* Sold Out State */}
              {seminarState === "soldout" && (
                <>
                  <div className="mb-6 p-4 bg-gray-300 border-2 border-gray-700 text-center">
                    <p className="font-bold text-gray-900 text-lg">SOLD OUT</p>
                    <p className="text-sm text-gray-700 mt-1">No seats available</p>
                  </div>
                  
                  <button className="w-full py-4 bg-gray-700 text-white font-bold hover:bg-gray-800 border-2 border-gray-800 text-lg">
                    Join Waitlist
                  </button>
                  
                  <p className="text-xs text-gray-600 mt-3 text-center">
                    You'll be notified if spots open up
                  </p>
                </>
              )}
              
              {/* Already Registered State */}
              {seminarState === "registered" && (
                <>
                  <div className="mb-6 p-4 bg-green-100 border-2 border-green-600 text-center">
                    <p className="font-bold text-green-900 text-lg">✓ YOU'RE REGISTERED</p>
                    <p className="text-sm text-green-800 mt-1">You have 1 ticket</p>
                  </div>
                  
                  <Link 
                    to="/my-page"
                    className="block w-full py-4 bg-gray-800 text-white font-bold text-center hover:bg-gray-900 border-2 border-gray-900 text-lg"
                  >
                    Go to My Page
                  </Link>
                  
                  <Link 
                    to={`/community/${id}`}
                    className="block w-full mt-3 py-4 bg-white border-2 border-gray-800 text-gray-800 font-bold text-center hover:bg-gray-100"
                  >
                    Join Community
                  </Link>
                </>
              )}
              
              {/* Event Ended State */}
              {seminarState === "ended" && (
                <>
                  <div className="mb-6 p-4 bg-gray-300 border-2 border-gray-700 text-center">
                    <p className="font-bold text-gray-900 text-lg">EVENT ENDED</p>
                    <p className="text-sm text-gray-700 mt-1">This seminar has concluded</p>
                  </div>
                  
                  <button className="w-full py-4 bg-gray-700 text-white font-bold hover:bg-gray-800 border-2 border-gray-800 mb-3">
                    View Summary
                  </button>
                  
                  <Link 
                    to={`/community/${id}`}
                    className="block w-full py-4 bg-white border-2 border-gray-800 text-gray-800 font-bold text-center hover:bg-gray-100"
                  >
                    View Community
                  </Link>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
