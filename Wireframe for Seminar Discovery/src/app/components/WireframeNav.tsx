import { Link } from "react-router";
import { User, Building2, Shield } from "lucide-react";

export function WireframeNav() {
  return (
    <nav className="border-b-2 border-gray-800 bg-gray-100 py-4">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-gray-800 uppercase tracking-wide">
          [Logo] Seminar Platform
        </Link>
        
        <div className="flex items-center gap-6">
          <Link to="/browse" className="text-gray-700 hover:text-gray-900 font-medium">
            Browse Seminars
          </Link>
          
          <div className="flex items-center gap-3 border-l-2 border-gray-400 pl-6">
            <Link 
              to="/my-page" 
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-700 hover:bg-gray-200 text-gray-800"
            >
              <User size={18} />
              <span>User</span>
            </Link>
            
            <Link 
              to="/org/dashboard" 
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-700 hover:bg-gray-200 text-gray-800"
            >
              <Building2 size={18} />
              <span>Org</span>
            </Link>
            
            <Link 
              to="/admin/dashboard" 
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-700 hover:bg-gray-200 text-gray-800"
            >
              <Shield size={18} />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
