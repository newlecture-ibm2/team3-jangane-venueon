import { WireframeNav } from "../components/WireframeNav";
import { useParams, Link, useNavigate } from "react-router";
import { CreditCard, Lock } from "lucide-react";
import { useState } from "react";

export function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment processing
    navigate("/confirmation");
  };

  const simulateError = () => {
    setShowError(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WireframeNav />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
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
              <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold border-2 border-gray-900">
                2
              </div>
              <span className="font-bold text-gray-900">Payment</span>
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
          {/* Payment Form */}
          <main className="col-span-2">
            <div className="border-2 border-gray-700 bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900 uppercase">Payment</h1>
                <div className="flex items-center gap-2 text-green-700">
                  <Lock size={18} />
                  <span className="text-sm font-medium">Secure Payment</span>
                </div>
              </div>
              
              {/* Error Message */}
              {showError && (
                <div className="mb-6 p-4 border-2 border-red-600 bg-red-50">
                  <p className="font-bold text-red-900 mb-1">Payment Failed</p>
                  <p className="text-sm text-red-800">There was an error processing your payment. Please check your payment details and try again.</p>
                  <button 
                    onClick={() => setShowError(false)}
                    className="mt-3 px-4 py-2 bg-red-600 text-white font-bold hover:bg-red-700 text-sm"
                  >
                    Retry Payment
                  </button>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Payment Method */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300">
                    Payment Method
                  </h2>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border-2 border-gray-700 bg-gray-50 cursor-pointer">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="card"
                        defaultChecked
                        className="w-5 h-5"
                      />
                      <CreditCard size={20} />
                      <span className="font-bold">Credit / Debit Card</span>
                    </label>
                    
                    <label className="flex items-center gap-3 p-4 border-2 border-gray-600 cursor-pointer hover:border-gray-700">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="paypal"
                        className="w-5 h-5"
                      />
                      <div className="w-5 h-5 bg-gray-400 border border-gray-600"></div>
                      <span className="font-bold">PayPal</span>
                    </label>
                    
                    <label className="flex items-center gap-3 p-4 border-2 border-gray-600 cursor-pointer hover:border-gray-700">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="bank"
                        className="w-5 h-5"
                      />
                      <div className="w-5 h-5 bg-gray-400 border border-gray-600"></div>
                      <span className="font-bold">Bank Transfer</span>
                    </label>
                  </div>
                </div>
                
                {/* Card Details */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300">
                    Card Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                        Card Number *
                      </label>
                      <input 
                        type="text"
                        placeholder="[1234 5678 9012 3456]"
                        className="w-full px-3 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                        Cardholder Name *
                      </label>
                      <input 
                        type="text"
                        placeholder="[Name on card]"
                        className="w-full px-3 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                          Expiry Date *
                        </label>
                        <input 
                          type="text"
                          placeholder="[MM/YY]"
                          className="w-full px-3 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                          CVV *
                        </label>
                        <input 
                          type="text"
                          placeholder="[123]"
                          className="w-full px-3 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Billing Address */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300">
                    Billing Address
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                        Country *
                      </label>
                      <select className="w-full px-3 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none" required>
                        <option>[Select country]</option>
                        <option>United States</option>
                        <option>Canada</option>
                        <option>United Kingdom</option>
                        <option>Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                        Postal Code *
                      </label>
                      <input 
                        type="text"
                        placeholder="[Postal/ZIP code]"
                        className="w-full px-3 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Link 
                    to={`/register/${id}`}
                    className="px-6 py-3 border-2 border-gray-700 text-gray-800 font-bold hover:bg-gray-100"
                  >
                    ← Back
                  </Link>
                  
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gray-800 text-white font-bold hover:bg-gray-900 border-2 border-gray-900"
                  >
                    Complete Payment →
                  </button>
                  
                  <button 
                    type="button"
                    onClick={simulateError}
                    className="px-6 py-3 border-2 border-red-600 text-red-700 font-bold hover:bg-red-50 text-sm"
                  >
                    [Test Error]
                  </button>
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
                  <span className="text-gray-900 font-medium">$49.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Service Fee</span>
                  <span className="text-gray-900 font-medium">$2.50</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-gray-900 uppercase">Total</span>
                <span className="text-2xl font-bold text-gray-900">$51.50</span>
              </div>
              
              <div className="p-3 bg-gray-100 border-2 border-gray-400 text-xs text-gray-600">
                [Your card will be charged immediately. Refund policy applies.]
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
