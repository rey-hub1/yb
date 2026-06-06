import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Lenis from 'lenis';
import YearbookApp from './components/YearbookFlipbook';
import AdminHub from './components/AdminHub';
import NotFound from './components/NotFound';
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

// router minimal berbasis hash — #admin (alias #admin-notes) atau path /admin → hub admin
function Root() {
  const [routeHash, setRouteHash] = useState(() => window.location.hash);
  const [routePath, setRoutePath] = useState(() => window.location.pathname);
  
  useEffect(() => {
    const onHashChange = () => setRouteHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    
    // Support history API pushState routing if needed
    const onPopState = () => {
      setRouteHash(window.location.hash);
      setRoutePath(window.location.pathname);
    };
    window.addEventListener('popstate', onPopState);
    
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  const isAdmin = routeHash === '#admin' || routeHash === '#admin-notes' || routePath === '/admin';
  const isHome = routePath === '/' || routePath === '/index.html' || routePath === '';

  if (isAdmin) {
    return <AdminHub />;
  }
  
  if (!isHome) {
    return <NotFound />;
  }

  return <YearbookApp />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);