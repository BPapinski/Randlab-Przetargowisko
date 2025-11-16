import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext'; // Pamiętaj o poprawnej ścieżce
import IndexPage from './pages/IndexPage';
import LoginPage from './pages/LoginPage';
import TenderFormPage from './pages/TenderFormPage';
import AliasFilterPage from './pages/AliasFilterPage';
import ResetPasswordRequestPage from './pages/ResetPasswordRequestPage';
import ResetPasswordConfirmationPage from './pages/ResetPasswordConfirmationPage';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password-request" element={<ResetPasswordRequestPage/>} />
          <Route path="/tenders/new" element={<TenderFormPage />} />
          <Route path="/alias-filter" element={<AliasFilterPage />} />
          <Route path="/reset-password-confirm" element={<ResetPasswordConfirmationPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);