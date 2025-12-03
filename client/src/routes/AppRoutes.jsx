import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Pages
import LoginRegister from '../pages/LoginRegister';
import HomeDashboard from '../pages/HomeDashboard';
import EventsDashboard from '../pages/EventsDashboard';
import CommunicationsView from '../pages/CommunicationsView';
import UserProfileView from '../pages/UserProfileView';
import AdminDashboard from '../pages/AdminDashboard';
import DirettivoDashboard from '../pages/DirettivoDashboard';
import { hasAdminAccess } from '../utils/constants';

const AppRoutes = ({ userProfile, onLoginSuccess, onLogout }) => {
    return (
        <Routes>
            <Route path="/login" element={
                !userProfile ? (
                    <LoginRegister onLoginSuccess={onLoginSuccess} />
                ) : (
                    <Navigate to="/" replace />
                )
            } />

            <Route path="/" element={
                <ProtectedRoute userProfile={userProfile}>
                    <HomeDashboard userProfile={userProfile} />
                </ProtectedRoute>
            } />

            <Route path="/events" element={
                <ProtectedRoute userProfile={userProfile}>
                    <EventsDashboard userProfile={userProfile} />
                </ProtectedRoute>
            } />

            <Route path="/comms" element={
                <ProtectedRoute userProfile={userProfile}>
                    <CommunicationsView userProfile={userProfile} />
                </ProtectedRoute>
            } />

            <Route path="/profile" element={
                <ProtectedRoute userProfile={userProfile}>
                    <UserProfileView userProfile={userProfile} onLogout={onLogout} />
                </ProtectedRoute>
            } />

            <Route path="/admin" element={
                <ProtectedRoute userProfile={userProfile}>
                    <AdminDashboard userProfile={userProfile} />
                </ProtectedRoute>
            } />

            <Route path="/direttivo" element={
                <ProtectedRoute userProfile={userProfile}>
                    {hasAdminAccess(userProfile) ? (
                        <DirettivoDashboard userProfile={userProfile} />
                    ) : (
                        <Navigate to="/" replace />
                    )}
                </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;