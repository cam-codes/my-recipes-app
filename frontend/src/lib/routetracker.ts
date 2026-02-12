import { useLocation } from '@solidjs/router';
import { createEffect } from 'solid-js';
import { trackPageView } from './analytics';

export default function RouteTracker() {
  const location = useLocation();

  createEffect(() => {
    trackPageView(location.pathname);
  });

  return null;
}
