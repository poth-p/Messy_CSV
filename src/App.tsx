import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { CleanerWorkspace } from './components/CleanerWorkspace';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { CookieBanner } from './components/CookieBanner';
import type { FileMetadata } from './components/CSVUploader';

function App() {
  // Global State for the "Session"
  const [data, setData] = useState<any[] | null>(null);
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
        <Route path="/" element={
          <>
            {data && metadata ? (
              <CleanerWorkspace
                data={data}
                metadata={metadata}
                onReset={handleReset}
              />
            ) : (
              <LandingPage onDataparsed={handleDataparsed} />
            )}
            <CookieBanner />
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;
