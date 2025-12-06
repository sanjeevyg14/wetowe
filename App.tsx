import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TripDetails from './pages/TripDetails';
import Admin from './pages/Admin';
import Destinations from './pages/Destinations';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';
import Blogs from './pages/Blogs';
import BlogDetails from './pages/BlogDetails';
import CreateBlog from './pages/CreateBlog';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trip/:id" element={<TripDetails />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blog/:id" element={<BlogDetails />} />
          <Route path="/create-blog" element={<CreateBlog />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;