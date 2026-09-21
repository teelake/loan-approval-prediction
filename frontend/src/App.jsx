import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Layout from './Layout'
import StudentLayout from './StudentLayout'
import AdminLayout from './admin/AdminLayout'
import AdminOverview from './admin/AdminOverview'
import AdminPerformance from './admin/AdminPerformance'
import AdminConfusion from './admin/AdminConfusion'
import AdminFeatures from './admin/AdminFeatures'
import AdminModel from './admin/AdminModel'
import Apply from './pages/Apply'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Result from './pages/Result'

function Protected({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      <Route
        element={
          <Protected>
            <StudentLayout />
          </Protected>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="apply" element={<Apply />} />
        <Route path="result" element={<Result />} />
        <Route path="history" element={<History />} />
      </Route>

      <Route
        path="/admin"
        element={
          <Protected adminOnly>
            <AdminLayout />
          </Protected>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="performance" element={<AdminPerformance />} />
        <Route path="confusion" element={<AdminConfusion />} />
        <Route path="features" element={<AdminFeatures />} />
        <Route path="model" element={<AdminModel />} />
      </Route>
    </Routes>
  )
}
