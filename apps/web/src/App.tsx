import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import ConsultantsPage from './pages/ConsultantsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/consultants" replace />} />

        <Route path="/consultants" element={<ConsultantsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
