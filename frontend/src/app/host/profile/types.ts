export interface HostProfile {
  id: number;
  userId: number;
  orgName: string;
  orgNumber: string;
  managerName: string;
  orgDescription?: string;
  profileImg?: string;
  createdAt: string;
  updatedAt?: string;
}
