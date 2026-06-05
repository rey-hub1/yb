import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Lenis from 'lenis';
import YearbookApp from './components/YearbookFlipbook';
import AdminNotes from './components/AdminNotes';
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

// router minimal berbasis hash — #admin-notes → halaman admin hapus note
function Root() {
  const [route, setRoute] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  if (route === '#admin-notes') {
    const goBack = () => { window.location.hash = ''; };
    return <AdminNotes onBack={goBack} />;
  }
  return <YearbookApp />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);