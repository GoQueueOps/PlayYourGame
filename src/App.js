import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

// PAGES
import Home from "./pages/Home";
import Explore from "./pages/Explore"; 
import Login from "./pages/Login";
import About from "./pages/About";
import Policies from "./pages/Policies";
import Contact from "./pages/Contact";
import ConfirmBooking from "./pages/ConfirmBooking";
import OwnerDashboard from "./pages/OwnerDashboard";
import Settings from "./pages/Settings";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import PlayAreaDetail from "./pages/PlayAreaDetail";
import BookingSuccess from "./pages/BookingSuccess";
import SuperAdmin from "./pages/SuperAdmin";
import MyBookings from "./pages/MyBookings";
import FindPlayers from "./pages/FindPlayers";
import ChallengeMode from "./pages/ChallengeMode";
import SubmitResult from "./pages/SubmitResult";
import VenueManager from "./pages/VenueManager";
import UserProfile from "./pages/UserProfile";
import Wallet from "./pages/Wallet";
import CommunityGroups from "./pages/CommunityGroups";
import Tournaments from "./pages/Tournaments";
import MatchReview from "./pages/MatchReview";
import AdminControlCenter from "./pages/AdminControlCenter";
import MatchLobby from "./pages/MatchLobby";
import PlayerProfile from "./pages/PlayerProfile";
import NotificationCenter from "./pages/NotificationCenter";
import CreateChallenge from "./pages/CreateChallenge";
import Crew from "./pages/Crew";
import SafetyCenter from "./pages/SafetyCenter";
import LobbyHub from "./pages/LobbyHub";
import GroupDetails from "./pages/GroupDetails";
import CreateGroup from "./pages/CreateGroup";
import GroupManagement from "./pages/GroupManagement";
import SearchPlayer from "./pages/SearchPlayers";
import OwnerLogin from "./pages/OwnerLogin";
import AdminLogin from "./pages/AdminLogin";
import CreateAppealModal from "./components/CreateAppealModal";
import ArenaLegends from "./pages/ArenaLegends";
import StandardProfile from "./pages/StandardProfile";
import Inbox from "./pages/Inbox";
import UniversalChat from "./pages/UniversalChat";
import ProtectedRoute from "./components/ProtectedRoute";
import Chat from "./pages/Chat";

function LayoutContent() {
  const location = useLocation();

  const hideLayoutPaths = [
    "/login", "/owner", "/settings", "/confirm", "/success",
    "/superadmin-portal", "/booking", "/find-players", "/challenge", 
    "/wallet", "/manager", "/match-review", "/admin", "/player", "/notifications",
    "/crew", "/match-lobby", "/challenge-select", "/safety", "/lobby-hub", "/group",
    "/create-group", "/group-management", "/search-players", "/submit-result", "/profile",
    "/community", "/tournaments", "/contact", "/about", "/terms", "/privacy",
    "/owner-login", "/admin-login", "/my-bookings", "/venue-manager", "/policies",
    "/create-appeal", "/arena-legends", "/play-area", "/standard-profile",
    "/inbox", "/chat"
  ];

  const shouldHide = hideLayoutPaths.some(path => 
    location.pathname.startsWith(path)
  );

  return (
    <>
      {!shouldHide && <Navbar />}
      <Routes>
        {/* ── PUBLIC ── */}
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Explore />} />
        <Route path="/login" element={<Login />} />
        <Route path="/owner-login" element={<OwnerLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/about" element={<About />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/play-area/:id" element={<PlayAreaDetail />} />
        <Route path="/player/:id" element={<PlayerProfile />} />
        <Route path="/arena-legends" element={<ArenaLegends />} />

        {/* ── LOGGED IN USERS ── */}
        <Route path="/confirm" element={<ProtectedRoute><ConfirmBooking /></ProtectedRoute>} />
        <Route path="/success" element={<ProtectedRoute><BookingSuccess /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/find-players" element={<ProtectedRoute><FindPlayers /></ProtectedRoute>} />
        <Route path="/challenge" element={<ProtectedRoute><ChallengeMode /></ProtectedRoute>} />
        <Route path="/challenge-select" element={<ProtectedRoute><CreateChallenge /></ProtectedRoute>} />
        <Route path="/submit-result" element={<ProtectedRoute><SubmitResult /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/standard-profile" element={<ProtectedRoute><StandardProfile /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><CommunityGroups /></ProtectedRoute>} />
        <Route path="/tournaments" element={<ProtectedRoute><Tournaments /></ProtectedRoute>} />
        <Route path="/match-review" element={<ProtectedRoute><MatchReview /></ProtectedRoute>} />
        <Route path="/match-lobby" element={<ProtectedRoute><MatchLobby /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationCenter /></ProtectedRoute>} />
        <Route path="/crew" element={<ProtectedRoute><Crew /></ProtectedRoute>} />
        <Route path="/safety" element={<ProtectedRoute><SafetyCenter /></ProtectedRoute>} />
        <Route path="/lobby-hub" element={<ProtectedRoute><LobbyHub /></ProtectedRoute>} />
        <Route path="/group/:id" element={<ProtectedRoute><GroupDetails /></ProtectedRoute>} />
        <Route path="/create-group" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
        <Route path="/group-management" element={<ProtectedRoute><GroupManagement /></ProtectedRoute>} />
        <Route path="/search-players" element={<ProtectedRoute><SearchPlayer /></ProtectedRoute>} />
        <Route path="/create-appeal" element={<ProtectedRoute><CreateAppealModal /></ProtectedRoute>} />
        <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
        <Route path="/chat/:type/:id" element={<ProtectedRoute><UniversalChat /></ProtectedRoute>} />
        <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

        {/* ── OWNER ONLY ── */}
        <Route path="/owner" element={
          <ProtectedRoute allowedRoles={['owner', 'admin', 'superadmin']}>
            <OwnerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/manager" element={
          <ProtectedRoute allowedRoles={['owner', 'admin', 'superadmin']}>
            <VenueManager />
          </ProtectedRoute>
        } />

        {/* ── ADMIN ONLY ── */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <AdminControlCenter />
          </ProtectedRoute>
        } />

        {/* ── SUPERADMIN ONLY ── */}
        <Route path="/superadmin-portal" element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <SuperAdmin />
          </ProtectedRoute>
        } />
      </Routes>
      {!shouldHide && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <LayoutContent />
    </Router>
  );
}