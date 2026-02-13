import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

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
import UserProfile  from "./pages/UserProfile";
import Wallet  from "./pages/Wallet";
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


function LayoutContent() {
  const location = useLocation();

  // Paths where main Navbar/Footer are hidden
  const hideLayoutPaths = [
    "/login", "/owner", "/settings", "/confirm", "/success",
    "/superadmin-portal", "/booking", "/find-players", "/challenge", 
    "/wallet", "/manager" , "/match-review", "/admin", "/player/:id", "/notifications",
    "/crew","/match-lobby", "/challenge-select", "/safety", "/lobby-hub", "/group",
    "/create-group", "/group-management", "/search-players"
  ];
  
  const shouldHide = hideLayoutPaths.some(path => location.pathname.startsWith(path));

  return (
    <>
      {!shouldHide && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* MARKETPLACE EXPLORE PAGE */}
        <Route path="/booking" element={<Explore />} /> 
        
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/confirm" element={<ConfirmBooking />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/success" element={<BookingSuccess />} />
        <Route path="/play-area/:id" element={<PlayAreaDetail />} />
        <Route path="/superadmin-portal" element={<SuperAdmin />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/challenge" element={<ChallengeMode />} />
        <Route path="/find-players" element={<FindPlayers />} />
        <Route path="/submit-result" element={<SubmitResult />} />
        <Route path="/manager" element={<VenueManager />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/community" element={<CommunityGroups />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/match-review" element={<MatchReview />} />
        <Route path="/admin" element={<AdminControlCenter />} />
        <Route path="/match-lobby" element={<MatchLobby />} />
        <Route path="/player/:id" element={<PlayerProfile />} />
        <Route path="/notifications" element={<NotificationCenter />} />
        <Route path="/challenge-select" element={<CreateChallenge />} />
        <Route path="/crew" element={<Crew />} />
        <Route path="/safety" element={<SafetyCenter />} />
        <Route path="/lobby-hub" element={<LobbyHub />} />
        <Route path="/group/:id" element={<GroupDetails />} />
        <Route path="/create-group" element={<CreateGroup />} />    
        <Route path="/group-management" element={<GroupManagement />} />
        <Route path="/search-players" element={<SearchPlayer />} />

      </Routes>
      {!shouldHide && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <LayoutContent />
    </Router>
  );
}