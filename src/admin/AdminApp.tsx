import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getAdminToken } from "./auth";
import AdminLogin from "./AdminLogin";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";
import AdminMessages from "./AdminMessages";
import AdminNewsletter from "./AdminNewsletter";
import AdminPagesEditor from "./AdminPagesEditor";
import AdminMediaLibrary from "./AdminMediaLibrary";
import AdminAnalytics from "./AdminAnalytics";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = getAdminToken();
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

export default function AdminApp() {
  const token = getAdminToken();

  return (
    <Routes>
      <Route
        path="login"
        element={token ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />}
      />
      <Route
        path="dashboard"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="analytics"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminAnalytics />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="messages"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminMessages />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="newsletter"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminNewsletter />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="pages"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminPagesEditor />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="media"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminMediaLibrary />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        index
        element={<Navigate to={token ? "/admin/dashboard" : "/admin/login"} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={token ? "/admin/dashboard" : "/admin/login"} replace />}
      />
    </Routes>
  );
}
