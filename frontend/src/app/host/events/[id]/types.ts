export interface SessionDetail {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  status: { id: number; label: string } | null;
  communityId: number | null;
}

export interface HostEventDetail {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  category: { id: number; label: string } | null;
  status: { id: number; label: string } | null;
  recruitmentStatus: { id: number; label: string } | null;
  createdAt: string;
  totalRevenue: number;
  totalAttendees: number;
  price: number;
  originalPrice: number;
  hasDiscount: boolean;
  location: string;
  hostName: string;
  sessions: SessionDetail[];
}

export interface Attendee {
  id: number;
  userName: string;
  email: string;
  phone: string;
  sessionTitle: string;
  paidAmount: number;
  status: string;
  createdAt: string;
}
