import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import ScheduleEditor from './pages/admin/ScheduleEditor';
import ManageTeachersPage from './pages/admin/ManageTeachers';
import ManageLeaves from './pages/admin/ManageLeaves';
import MyLeave from './pages/teacher/MyLeave';
import AdminSubstitutions from './pages/admin/Substitutions';
import TeacherSubstitutions from './pages/teacher/Substitutions';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Fallback for the root path, maybe a landing page or redirect */}
      <Route path="/" element={
          <div className="text-center p-10">
              <h1 className="text-4xl font-bold">Welcome to ClassSync</h1>
              <p className="text-lg mt-2 text-gray-600">Please <Link to="/login" className="text-indigo-600">login</Link> to continue.</p>
          </div>
      } />

      {/* Protected teacher routes */}
      <Route 
        path="/teacher/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <DashboardLayout>
              <TeacherDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher/my-schedule" 
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <DashboardLayout>
              <TeacherDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher/apply-leave" 
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <DashboardLayout>
              <MyLeave />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher/substitutions" 
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <DashboardLayout>
              <TeacherSubstitutions />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Protected admin routes */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
             <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
       <Route 
        path="/admin/teacher-schedule/:teacherId" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
             <DashboardLayout>
              <ScheduleEditor />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/manage-teachers" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
             <DashboardLayout>
              <ManageTeachersPage />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/manage-leaves" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
             <DashboardLayout>
              <ManageLeaves />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/substitutions" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <AdminSubstitutions />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
