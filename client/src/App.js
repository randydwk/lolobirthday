import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/fo/Home';
import Gestion from './pages/bo/Gestion';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gestion" element={<Gestion />} />
      </Routes>
    </Router>
  );
}

export default App;
