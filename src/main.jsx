import React from 'react';
import ReactDOM from 'react-dom/client';
import Lenis from 'lenis';
import YearbookApp from './components/YearbookFlipbook';
import './index.css';

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <YearbookApp />
  </React.StrictMode>
);