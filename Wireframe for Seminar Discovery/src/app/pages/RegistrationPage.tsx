import { WireframeNav } from "../components/WireframeNav";
import { useParams, Link } from "react-router";
import { User, Mail, Phone } from "lucide-react";

export function RegistrationPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <WireframeNav />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold border-2 border-gray-900">
                1
              </div>
              <span className="font-bold text-gray-900">Registration</span>
            </div>
            
            <div className="w-16 h-0.5 bg-gray-400"></div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold border-2 border-gray-500">
                2
              </div>
              <span className="text-gray-600">Payment</span>
            </div>
            
            <div className="w-16 h-0.5 bg-gray-400"></div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold border-2 border-gray-500">
                3
              </div>
              <span className="text-gray-600">Confirmation</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-8">
          {/* Registration Form */}
          <main className="col-span-2">
            <div className="border-2 border-gray-700 bg-white p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-6 uppercase">Registration Information</h1>
              
              <form className="space-y-6">
                {/* Attendee Info */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300">
                    Attendee Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                        Full Name *
                      </label>
                      <div className="flex items-center gap-2">
                        <User size={18} className="text-gray-600" />
                        <input 
                          type="text"
                          placeholder="[Enter your full name]"
                          className="flex-1 px-3 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                        Email Address *
                      </label>
                      <div className="flex items-center gap-2">
                        <Mail size={18} className="text-gray-600" />
                        <input 
                          type="email"
                          placeholder="[Enter your email]"
                          className="flex-1 px-3 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                        Phone Number
                      </label>
                      <div className="flex items-center gap-2">
                        <Phone size={18} className="text-gray-600" />
                        <input 
                          type="tel"
                          placeholder="[Enter your phone number]"
                          className="flex-1 px-3 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Ticket Selection */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300">
                    Ticket Selection
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border-2 border-gray-600">
                      <div>
                        <p className="font-bold text-gray-900">General Admission</p>
                        <p className="text-sm text-gray-600">Free</p>
                      </div>
                      <select className="px-3 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none">
                        <option value="1">1 ticket</option>
                        <option value="2">2 tickets</option>
                        <option value="3">3 tickets</option>
                        <option value="4">4 tickets</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Additional Questions */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300">
                    Additional Information
                  </h2>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                      How did you hear about this seminar?
                    </label>
                    <select className="w-full px-3 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none">
                      <option>[Select an option]</option>
                      <option>Social Media</option>
                      <option>Email</option>
                      <option>Friend/Colleague</option>
                      <option>Website</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                
                {/* Terms */}
                <div className="flex items-start gap-3 p-4 border-2 border-gray-400 bg-gray-50">
                  <input type="checkbox" className="w-5 h-5 mt-0.5" required />
                  <label className="text-sm text-gray-700">
                    I agree to the <span className="underline">Terms and Conditions</span> and <span className="underline">Privacy Policy</span>
                  </label>
                </div>
                
                <div className="flex gap-4">
                  <Link 
                    to={`/seminar/${id}`}
                    className="px-6 py-3 border-2 border-gray-700 text-gray-800 font-bold hover:bg-gray-100"
                  >
                    ← Back
                  </Link>
                  
                  <Link 
                    to={`/payment/${id}`}
                    className="flex-1 px-6 py-3 bg-gray-800 text-white font-bold text-center hover:bg-gray-900 border-2 border-gray-900"
                  >
                    Continue to Payment →
                  </Link>
                </div>
              </form>
            </div>
          </main>
          
          {/* Order Summary */}
          <aside className="col-span-1">
            <div className="sticky top-8 border-2 border-gray-700 bg-white p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase">Order Summary</h3>
              
              <div className="mb-4 pb-4 border-b-2 border-gray-300">
                <p className="font-bold text-gray-900 mb-2">AI in Modern Business Strategy</p>
                <p className="text-sm text-gray-600">April 15, 2026</p>
                <p className="text-sm text-gray-600">2:00 PM - 5:00 PM</p>
              </div>
              
              <div className="space-y-2 mb-4 pb-4 border-b-2 border-gray-300">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">General Admission x1</span>
                  <span className="text-gray-900 font-medium">Free</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-gray-900 uppercase">Total</span>
                <span className="text-2xl font-bold text-gray-900">Free</span>
              </div>
              
              <div className="p-3 bg-gray-100 border-2 border-gray-400 text-xs text-gray-600">
                [Confirmation email will be sent to your registered email address]
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
