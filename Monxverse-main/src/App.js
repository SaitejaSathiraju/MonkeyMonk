import { Route, Routes } from "react-router-dom";
import { HashRouter as Router } from "react-router-dom";
import "./App.css";

import Login from "./pages/login/Login";
import Registration from "./pages/registration/Registration";
import RootLayout from "./components/sidebar/RootLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/profile/Profile";
import Chat from "./pages/chat/Chat";
import CompleteProfile from "./pages/completeProfile/CompleteProfile";

import TermsAndConditions from './containers/Terms/TermsAndConditions';
import PrivacyPolicy from './containers/Terms/PrivacyPolicy';
import EmailVerification from "./pages/EmailVerification/EmailVerification";

function App() {
  return (
    <Router>
      <Routes>
          <Route path='/terms&conditions' element={<TermsAndConditions/>} />
          <Route path='/privacypolicy' element={<PrivacyPolicy/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/completeProfile" element={<CompleteProfile />} />
        <Route path="/verifyEmail" element={<EmailVerification />} />
        <Route
          path="/*"
          element={
            <RootLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/chat" element={<Chat />} />
              </Routes>
            </RootLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
