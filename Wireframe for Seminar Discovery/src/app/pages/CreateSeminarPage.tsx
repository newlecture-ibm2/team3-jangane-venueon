import { WireframeNav } from "../components/WireframeNav";
import { Link } from "react-router";
import { useState } from "react";
import { Plus, X } from "lucide-react";

export function CreateSeminarPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [sessions, setSessions] = useState([
    { time: "", title: "" },
  ]);

  const addSession = () => {
    setSessions([...sessions, { time: "", title: "" }]);
  };

  const removeSession = (index: number) => {
    setSessions(sessions.filter((_, i) => i !== index));
  };

  const steps = [
    { number: 1, label: "Basic Info" },
    { number: 2, label: "Schedule" },
    { number: 3, label: "Sessions" },
    { number: 4, label: "Tickets" },
    { number: 5, label: "Review" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <WireframeNav />
      
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 uppercase">Create New Seminar</h1>
          <p className="text-gray-700">Fill in the details to create your seminar</p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${
                    currentStep === step.number
                      ? "bg-gray-800 text-white border-gray-900"
                      : currentStep > step.number
                      ? "bg-gray-400 text-white border-gray-600"
                      : "bg-gray-200 text-gray-600 border-gray-500"
                  }`}>
                    {currentStep > step.number ? "✓" : step.number}
                  </div>
                  <span className={`text-sm mt-2 font-medium ${
                    currentStep === step.number ? "text-gray-900" : "text-gray-600"
                  }`}>
                    {step.label}
                  </span>
                </div>
                
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 ${
                    currentStep > step.number ? "bg-gray-800" : "bg-gray-400"
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Form Content */}
        <div className="border-2 border-gray-700 bg-white p-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 uppercase">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                  Seminar Title *
                </label>
                <input 
                  type="text"
                  placeholder="[Enter seminar title]"
                  className="w-full px-4 py-3 border-2 border-gray-400 focus:border-gray-700 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                  Category *
                </label>
                <select className="w-full px-4 py-3 border-2 border-gray-400 focus:border-gray-700 outline-none">
                  <option>[Select a category]</option>
                  <option>Business</option>
                  <option>Technology</option>
                  <option>Design</option>
                  <option>Marketing</option>
                  <option>Finance</option>
                  <option>Education</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                  Description *
                </label>
                <textarea 
                  placeholder="[Enter detailed description of your seminar]"
                  className="w-full px-4 py-3 border-2 border-gray-400 focus:border-gray-700 outline-none min-h-40 resize-y"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                  Thumbnail Image *
                </label>
                <div className="border-2 border-dashed border-gray-400 bg-gray-50 p-8 text-center">
                  <p className="text-gray-600 mb-3">[Click to upload or drag and drop]</p>
                  <button className="px-6 py-2 bg-gray-700 text-white font-bold hover:bg-gray-800 border-2 border-gray-800">
                    Upload Image
                  </button>
                  <p className="text-sm text-gray-500 mt-3">Recommended: 1200x600px, JPG or PNG</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Schedule & Format */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 uppercase">Schedule & Format</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                    Date *
                  </label>
                  <input 
                    type="date"
                    className="w-full px-4 py-3 border-2 border-gray-400 focus:border-gray-700 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                    Time Zone *
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-400 focus:border-gray-700 outline-none">
                    <option>[Select time zone]</option>
                    <option>UTC</option>
                    <option>EST</option>
                    <option>PST</option>
                    <option>GMT</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                    Start Time *
                  </label>
                  <input 
                    type="time"
                    className="w-full px-4 py-3 border-2 border-gray-400 focus:border-gray-700 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                    End Time *
                  </label>
                  <input 
                    type="time"
                    className="w-full px-4 py-3 border-2 border-gray-400 focus:border-gray-700 outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                  Format *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-600 cursor-pointer hover:border-gray-800">
                    <input type="radio" name="format" value="online" className="w-5 h-5" />
                    <div>
                      <p className="font-bold text-gray-900">Online</p>
                      <p className="text-sm text-gray-600">Virtual meeting via link</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-600 cursor-pointer hover:border-gray-800">
                    <input type="radio" name="format" value="offline" className="w-5 h-5" />
                    <div>
                      <p className="font-bold text-gray-900">In-Person</p>
                      <p className="text-sm text-gray-600">Physical location</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-600 cursor-pointer hover:border-gray-800">
                    <input type="radio" name="format" value="hybrid" className="w-5 h-5" />
                    <div>
                      <p className="font-bold text-gray-900">Hybrid</p>
                      <p className="text-sm text-gray-600">Both online and in-person</p>
                    </div>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                  Location / Meeting Link
                </label>
                <input 
                  type="text"
                  placeholder="[Enter physical address or meeting URL - can be added later]"
                  className="w-full px-4 py-3 border-2 border-gray-400 focus:border-gray-700 outline-none"
                />
              </div>
            </div>
          )}
          
          {/* Step 3: Sessions */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 uppercase">Session Breakdown</h2>
                <button 
                  onClick={addSession}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-bold hover:bg-gray-800 border-2 border-gray-800"
                >
                  <Plus size={18} />
                  Add Session
                </button>
              </div>
              
              <div className="space-y-4">
                {sessions.map((session, idx) => (
                  <div key={idx} className="border-2 border-gray-600 bg-gray-50 p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                            Session {idx + 1} Time
                          </label>
                          <input 
                            type="text"
                            placeholder="[e.g., 2:00-2:30 PM]"
                            className="w-full px-3 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none"
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                            Session Title
                          </label>
                          <input 
                            type="text"
                            placeholder="[e.g., Introduction to AI Concepts]"
                            className="w-full px-3 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none"
                          />
                        </div>
                      </div>
                      
                      {sessions.length > 1 && (
                        <button 
                          onClick={() => removeSession(idx)}
                          className="mt-8 p-2 border-2 border-red-600 text-red-700 hover:bg-red-50"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-2 border-gray-400 bg-gray-100 text-sm text-gray-700">
                [Add multiple sessions to break down your seminar schedule. This helps attendees understand the flow of the event.]
              </div>
            </div>
          )}
          
          {/* Step 4: Ticket Setup */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 uppercase">Ticket Setup</h2>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                  Ticket Type *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-600 cursor-pointer hover:border-gray-800">
                    <input type="radio" name="ticket" value="free" className="w-5 h-5" />
                    <div>
                      <p className="font-bold text-gray-900">Free</p>
                      <p className="text-sm text-gray-600">No charge for attendees</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-600 cursor-pointer hover:border-gray-800">
                    <input type="radio" name="ticket" value="paid" className="w-5 h-5" />
                    <div>
                      <p className="font-bold text-gray-900">Paid</p>
                      <p className="text-sm text-gray-600">Set a price for tickets</p>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                    Price per Ticket
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-bold text-xl">$</span>
                    <input 
                      type="number"
                      placeholder="[0.00]"
                      className="flex-1 px-4 py-3 border-2 border-gray-400 focus:border-gray-700 outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                    Total Capacity *
                  </label>
                  <input 
                    type="number"
                    placeholder="[Max attendees]"
                    className="w-full px-4 py-3 border-2 border-gray-400 focus:border-gray-700 outline-none"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                    Sale Start Date
                  </label>
                  <input 
                    type="date"
                    className="w-full px-4 py-3 border-2 border-gray-400 focus:border-gray-700 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                    Sale End Date
                  </label>
                  <input 
                    type="date"
                    className="w-full px-4 py-3 border-2 border-gray-400 focus:border-gray-700 outline-none"
                  />
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 border-2 border-gray-400 bg-gray-50">
                <input type="checkbox" className="w-5 h-5 mt-0.5" />
                <label className="text-sm text-gray-700">
                  Enable waitlist when sold out
                </label>
              </div>
            </div>
          )}
          
          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 uppercase">Review & Publish</h2>
              
              <div className="border-2 border-gray-600 bg-gray-50 p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Seminar Summary</h3>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 uppercase mb-1">Title</p>
                      <p className="font-bold text-gray-900">[Your Seminar Title]</p>
                    </div>
                    <div>
                      <p className="text-gray-600 uppercase mb-1">Category</p>
                      <p className="font-bold text-gray-900">[Selected Category]</p>
                    </div>
                    <div>
                      <p className="text-gray-600 uppercase mb-1">Format</p>
                      <p className="font-bold text-gray-900">[Online/Offline]</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm pt-4 border-t-2 border-gray-300">
                    <div>
                      <p className="text-gray-600 uppercase mb-1">Date & Time</p>
                      <p className="font-bold text-gray-900">[Selected Date & Time]</p>
                    </div>
                    <div>
                      <p className="text-gray-600 uppercase mb-1">Price</p>
                      <p className="font-bold text-gray-900">[Free / $XX]</p>
                    </div>
                    <div>
                      <p className="text-gray-600 uppercase mb-1">Capacity</p>
                      <p className="font-bold text-gray-900">[XX seats]</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-2 border-blue-600 bg-blue-50">
                <p className="text-sm text-blue-900">
                  <span className="font-bold">Note:</span> After publishing, your seminar will be visible to all users. You can still edit details or unpublish later if needed.
                </p>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-gray-400">
            <div className="flex gap-3">
              <Link 
                to="/org/dashboard"
                className="px-6 py-3 border-2 border-gray-600 text-gray-700 font-bold hover:bg-gray-100"
              >
                Cancel
              </Link>
              
              {currentStep > 1 && (
                <button 
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-3 border-2 border-gray-700 text-gray-800 font-bold hover:bg-gray-100"
                >
                  ← Previous
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              <button className="px-6 py-3 border-2 border-gray-600 text-gray-700 font-bold hover:bg-gray-100">
                Save as Draft
              </button>
              
              {currentStep < 5 ? (
                <button 
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-8 py-3 bg-gray-800 text-white font-bold hover:bg-gray-900 border-2 border-gray-900"
                >
                  Next →
                </button>
              ) : (
                <Link 
                  to="/org/dashboard"
                  className="px-8 py-3 bg-gray-800 text-white font-bold hover:bg-gray-900 border-2 border-gray-900"
                >
                  Publish Seminar
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
