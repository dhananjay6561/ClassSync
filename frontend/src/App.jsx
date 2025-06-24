import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import { useAuth } from './context/AuthContext';
import './App.css'

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <nav className="bg-gray-800 p-4">
        <ul className="flex justify-center space-x-6 text-white">
          <li><Link to="/" className="hover:text-gray-300">Home</Link></li>
          
          {user ? (
            <>
              {user.role === 'admin' && (
                <li><Link to="/admin/dashboard" className="hover:text-gray-300">Admin Dashboard</Link></li>
              )}
              {user.role === 'teacher' && (
                 <li><Link to="/teacher/dashboard" className="hover:text-gray-300">Teacher Dashboard</Link></li>
              )}
              <li>
                <button onClick={handleLogout} className="hover:text-gray-300 bg-transparent border-none">Logout</button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="hover:text-gray-300">Login</Link></li>
              <li><Link to="/register" className="hover:text-gray-300">Register</Link></li>
            </>
          )}
        </ul>
      </nav>

      <main className="p-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/" element={
            <div className="text-center mt-10">
              <h1 className="text-4xl font-bold">Welcome to ClassSync</h1>
              <p className="text-lg mt-2 text-gray-600">Please use the navigation above to move around.</p>
            </div>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App
