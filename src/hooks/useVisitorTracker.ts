import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY_VISITOR = "itid_analytics_vid";
const STORAGE_KEY_SESSION = "itid_analytics_sid";
const STORAGE_KEY_SESSION_TIME = "itid_analytics_session_time";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes d'inactivité

function generateId(prefix: string): string {
  const rand = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function getVisitorToken(): string {
  let vid = localStorage.getItem(STORAGE_KEY_VISITOR);
  if (!vid) {
    vid = generateId("v");
    localStorage.setItem(STORAGE_KEY_VISITOR, vid);
  }
  return vid;
}

function getSessionToken(): string {
  const now = Date.now();
  const lastActiveStr = sessionStorage.getItem(STORAGE_KEY_SESSION_TIME);
  const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;
  let sid = sessionStorage.getItem(STORAGE_KEY_SESSION);

  if (!sid || (now - lastActive > SESSION_TIMEOUT_MS)) {
    sid = generateId("s");
    sessionStorage.setItem(STORAGE_KEY_SESSION, sid);
  }

  sessionStorage.setItem(STORAGE_KEY_SESSION_TIME, String(now));
  return sid;
}

function sendBeaconData(payload: Record<string, any>) {
  const url = "/api/analytics/track";
  const data = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([data], { type: "application/json" });
    const success = navigator.sendBeacon(url, blob);
    if (success) return;
  }

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: data,
    keepalive: true,
  }).catch(() => {});
}

export function useVisitorTracker() {
  const location = useLocation();
  const pageEnterTimeRef = useRef<number>(Date.now());
  const currentPathRef = useRef<string>(location.pathname + location.search);
  const heartbeatTimerRef = useRef<number | null>(null);

  // 1. Déclenchement à chaque changement de page
  useEffect(() => {
    // Ne jamais tracker les pages d'administration
    if (location.pathname.startsWith("/admin")) {
      return;
    }

    const visitorToken = getVisitorToken();
    const sessionToken = getSessionToken();
    const fullPath = location.pathname + location.search;
    currentPathRef.current = fullPath;
    pageEnterTimeRef.current = Date.now();

    const payload = {
      type: "pageview",
      visitor_token: visitorToken,
      session_token: sessionToken,
      page_url: window.location.href,
      page_path: fullPath,
      page_title: document.title || "ITID France",
      referrer: document.referrer || null,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      language: navigator.language || "fr",
    };

    // Envoi asynchrone non-bloquant
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});

    // Maintien d'activité Heartbeat toutes les 45s si l'onglet reste actif
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
    }
    heartbeatTimerRef.current = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        sessionStorage.setItem(STORAGE_KEY_SESSION_TIME, String(Date.now()));
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "heartbeat",
            visitor_token: visitorToken,
            session_token: sessionToken,
            page_path: fullPath,
          }),
        }).catch(() => {});
      }
    }, 45000);

    return () => {
      // Calcul du temps passé sur la page au moment de la transition
      const durationSeconds = Math.max(0, Math.round((Date.now() - pageEnterTimeRef.current) / 1000));
      if (durationSeconds > 0) {
        sendBeaconData({
          type: "leave",
          visitor_token: visitorToken,
          session_token: sessionToken,
          page_path: fullPath,
          duration_seconds: durationSeconds,
        });
      }
    };
  }, [location.pathname, location.search]);

  // 2. Gestion de la fermeture ou masquage de l'onglet (pagehide / visibilitychange)
  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;

    const handleLeave = () => {
      const visitorToken = getVisitorToken();
      const sessionToken = getSessionToken();
      const durationSeconds = Math.max(0, Math.round((Date.now() - pageEnterTimeRef.current) / 1000));

      if (durationSeconds > 0) {
        sendBeaconData({
          type: "leave",
          visitor_token: visitorToken,
          session_token: sessionToken,
          page_path: currentPathRef.current,
          duration_seconds: durationSeconds,
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleLeave();
      } else {
        pageEnterTimeRef.current = Date.now();
        sessionStorage.setItem(STORAGE_KEY_SESSION_TIME, String(Date.now()));
      }
    };

    window.addEventListener("pagehide", handleLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
      }
      window.removeEventListener("pagehide", handleLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
}
