import { WireframeNav } from "../components/WireframeNav";
import { Link } from "react-router";
import { CheckCircle2, Calendar, Mail } from "lucide-react";

export function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <WireframeNav />
      
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold border-2 border-gray-600">
                ✓
              </div>
              <span className="text-gray-600">Registration</span>
            </div>
            
            <div className="w-16 h-0.5 bg-gray-800"></div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold border-2 border-gray-600">
                ✓
              </div>
              <span className="text-gray-600">Payment</span>
            </div>
            
            <div className="w-16 h-0.5 bg-gray-800"></div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold border-2 border-gray-900">
                ✓
              </div>
              <span className="font-bold text-gray-900">Confirmation</span>
            </div>
          </div>
        </div>
        
        {/* Success Message */}
        <div className="border-2 border-gray-800 bg-white p-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle2 size={80} className="text-gray-800" strokeWidth={2} />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-3 uppercase">
            Registration Complete!
          </h1>
          
          <p className="text-lg text-gray-700 mb-8">
            You're all set! Your registration has been confirmed.
          </p>
          
          {/* Confirmation Details */}
          <div className="border-2 border-gray-600 bg-gray-50 p-6 mb-8 text-left">
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="text-gray-600 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-600 uppercase">Event</p>
                  <p className="font-bold text-gray-900">AI in Modern Business Strategy</p>
                  <p className="text-gray-700">April 15, 2026 · 2:00 PM - 5:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 pt-3 border-t-2 border-gray-300">
                <Mail className="text-gray-600 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-600 uppercase">Confirmation Email</p>
                  <p className="text-gray-700">A confirmation email has been sent to:</p>
                  <p className="font-bold text-gray-900">your.email@example.com</p>
                </div>
              </div>
              
              <div className="pt-3 border-t-2 border-gray-300">
                <p className="text-sm text-gray-600 uppercase mb-1">Order Number</p>
                <p className="font-mono text-gray-900 font-bold text-lg">#ORD-2026-00123</p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Link 
              to="/my-page"
              className="block w-full px-6 py-4 bg-gray-800 text-white font-bold hover:bg-gray-900 border-2 border-gray-900 text-lg"
            >
              Go to My Page
            </Link>
            
            <Link 
              to="/community/1"
              className="block w-full px-6 py-4 bg-white border-2 border-gray-800 text-gray-800 font-bold hover:bg-gray-100"
            >
              Join Community
            </Link>
            
            <Link 
              to="/browse"
              className="block w-full px-6 py-3 text-gray-700 hover:text-gray-900 font-medium underline"
            >
              Browse More Seminars
            </Link>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="mt-6 p-4 border-2 border-gray-600 bg-white">
          <h3 className="font-bold text-gray-900 mb-2 uppercase text-sm">What's Next?</h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>You'll receive a reminder email 24 hours before the event</li>
            <li>The meeting link will be sent 1 hour before start time</li>
            <li>You can view event details in your "My Page" section</li>
            <li>Join the community to connect with other attendees</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
