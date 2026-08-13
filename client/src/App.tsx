import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import Dashboard from "./pages/Dashboard";
import MyCourses from "./pages/MyCourses";
import Cart from "./pages/Cart";
import LearnCourse from "./pages/LearnCourse";
import AdminUsers from "./pages/AdminUsers";
import CourseStudents from "./pages/CourseStudents";
import InstructorCourses from "./pages/InstructorCourses";
import Profile from "./pages/Profile";
import AdminLogs from "./pages/AdminLogs";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
        <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/learn/:id" element={<ProtectedRoute><LearnCourse /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/instructor/courses" element={<ProtectedRoute><InstructorCourses /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin/logs" element={<ProtectedRoute><AdminLogs /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
        <Route path="/courses/:id/students" element={<ProtectedRoute><CourseStudents /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default App;
