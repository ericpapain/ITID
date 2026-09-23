import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";
import AdminMessages from "./AdminMessages";
import AdminNewsletter from "./AdminNewsletter";
import AdminPagesEditor from "./AdminPagesEditor";
import AdminMediaLibrary from "./AdminMediaLibrary";
import AdminAnalytics from "./AdminAnalytics";

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route
        path="dashboard"
        element={
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        }
      />
      <Route
        path="analytics"
        element={
          <AdminLayout>
            <AdminAnalytics />
          </AdminLayout>
        }
      />
      <Route
        path="messages"
        element={
          <AdminLayout>
            <AdminMessages />
          </AdminLayout>
        }
      />
      <Route
        path="newsletter"
        element={
          <AdminLayout>
            <AdminNewsletter />
          </AdminLayout>
        }
      />
      <Route
        path="pages"
        element={
          <AdminLayout>
            <AdminPagesEditor />
          </AdminLayout>
        }
      />
      <Route
        path="media"
        element={
          <AdminLayout>
            <AdminMediaLibrary />
          </AdminLayout>
        }
      />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}
