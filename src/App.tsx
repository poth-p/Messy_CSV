import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LandingPage } from './components/LandingPage';
import { CleanerWorkspace } from './components/CleanerWorkspace';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { CookieBanner } from './components/CookieBanner';
import { UserTierProvider } from './lib/UserTierContext';
import { DevToolsPanel } from './dev-tools/DevToolsPanel';
import { BatchPage } from './pages/BatchPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { FileMetadata } from './components/CSVUploader';
import type { CSVData } from './lib/types';

function App() {
  return (
    <UserTierProvider>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <AppContent />
    </UserTierProvider>
  );
}

function AppContent() {
  // Global State for the "Session"
  const [data, setData] = useState<CSVData | null>(null);
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);

  const handleDataparsed = (parsedData: any[], meta: FileMetadata) => {
    setData(parsedData);
    setMetadata(meta);
  };

  const handleReset = () => {
    setData(null);
    setMetadata(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/batch" element={
          <ErrorBoundary>
            <BatchPage />
          </ErrorBoundary>
        } />
        <Route path="/" element={
          <>
            {data && metadata ? (
              <ErrorBoundary>
                <CleanerWorkspace
                  data={data}
                  metadata={metadata}
                  onReset={handleReset}
                />
              </ErrorBoundary>
            ) : (
              <LandingPage onDataparsed={handleDataparsed} />
            )}
            <CookieBanner />
            <DevToolsPanel />
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;
