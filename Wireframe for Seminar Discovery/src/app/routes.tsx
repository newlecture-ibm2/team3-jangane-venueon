import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { BrowsePage } from "./pages/BrowsePage";
import { SeminarDetailPage } from "./pages/SeminarDetailPage";
import { RegistrationPage } from "./pages/RegistrationPage";
import { PaymentPage } from "./pages/PaymentPage";
import { ConfirmationPage } from "./pages/ConfirmationPage";
import { UserMyPage } from "./pages/UserMyPage";
import { CommunityPage } from "./pages/CommunityPage";
import { OrgDashboard } from "./pages/OrgDashboard";
import { CreateSeminarPage } from "./pages/CreateSeminarPage";
import { AdminDashboard } from "./pages/AdminDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/browse",
    Component: BrowsePage,
  },
  {
    path: "/seminar/:id",
    Component: SeminarDetailPage,
  },
  {
    path: "/register/:id",
    Component: RegistrationPage,
  },
  {
    path: "/payment/:id",
    Component: PaymentPage,
  },
  {
    path: "/confirmation",
    Component: ConfirmationPage,
  },
  {
    path: "/my-page",
    Component: UserMyPage,
  },
  {
    path: "/community/:seminarId",
    Component: CommunityPage,
  },
  {
    path: "/org/dashboard",
    Component: OrgDashboard,
  },
  {
    path: "/org/create-seminar",
    Component: CreateSeminarPage,
  },
  {
    path: "/admin/dashboard",
    Component: AdminDashboard,
  },
]);
