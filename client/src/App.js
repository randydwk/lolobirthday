import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Code from './pages/Code';
import Gestion from './pages/Gestion';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/c" element={<Code />} />
        <Route path="/gestion" element={<Gestion />} />
      </Routes>
    </Router>
  );
}

export default App;
