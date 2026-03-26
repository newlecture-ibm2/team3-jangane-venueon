import { Link } from "react-router";
import { Calendar, MapPin, DollarSign, Building } from "lucide-react";

interface SeminarCardProps {
  id: string;
  title: string;
  organizer: string;
  date: string;
  time: string;
  price: string;
  location: string;
  thumbnail?: boolean;
}

export function SeminarCard({
  id,
  title,
  organizer,
  date,
  time,
  price,
  location,
  thumbnail = true,
}: SeminarCardProps) {
  return (
    <Link 
      to={`/seminar/${id}`}
      className="block border-2 border-gray-600 bg-white hover:border-gray-800 transition-colors"
    >
      {thumbnail && (
        <div className="bg-gray-300 border-b-2 border-gray-600 h-40 flex items-center justify-center text-gray-600">
          [Thumbnail]
        </div>
      )}
      
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Building size={16} />
          <span>{organizer}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Calendar size={16} />
          <span>{date} · {time}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <MapPin size={16} />
          <span>{location}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm font-bold text-gray-900 pt-2 border-t border-gray-300">
          <DollarSign size={16} />
          <span>{price}</span>
        </div>
      </div>
    </Link>
  );
}
