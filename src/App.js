import React from 'react';
import Map from './components/map/map.js';
import Navbar from './components/navbar/navbar.js';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar/>
      <Map/>
    </div>
  );
}

export default App;
