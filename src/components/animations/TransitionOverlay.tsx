import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useTransitionStore } from "../../store/transitionStore";

export function TransitionOverlay() {
  const { isAnimating, targetRoute, endTransition } = useTransitionStore();
  const navigate = useNavigate();
  const location = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (isAnimating && targetRoute && targetRoute !== location.pathname) {
      const tl = gsap.timeline({
        onComplete: () => {
          endTransition();
        },
      });

      // Show overlay
      gsap.set(overlayRef.current, { display: "block" });

      // Path definitions
      const initialPath = "M 0 100 Q 50 100 100 100 L 100 100 Q 50 100 0 100 Z";
      const midEntryPath = "M 0 100 Q 50 100 100 100 L 100 50 Q 50 0 0 50 Z";
      const coveredPath = "M 0 100 Q 50 100 100 100 L 100 0 Q 50 0 0 0 Z";
      const midExitPath = "M 0 50 Q 50 100 100 50 L 100 0 Q 50 0 0 0 Z";
      const exitedPath = "M 0 0 Q 50 0 100 0 L 100 0 Q 50 0 0 0 Z";

      // 1. Entrance animation (drawing the SVG up)
      tl.set(pathRef.current, { attr: { d: initialPath } })
        .to(pathRef.current, {
          duration: 0.4,
          attr: { d: midEntryPath },
          ease: "power2.in",
        })
        .to(pathRef.current, {
          duration: 0.4,
          attr: { d: coveredPath },
          ease: "power2.out",
          onComplete: () => {
            // 2. Change route when screen is fully covered
            navigate(targetRoute);
            window.scrollTo(0, 0);
          },
        })
        // 3. Exit animation (retracting the SVG up)
        .to(pathRef.current, {
          duration: 0.4,
          attr: { d: midExitPath },
          ease: "power2.in",
        })
        .to(pathRef.current, {
          duration: 0.4,
          attr: { d: exitedPath },
          ease: "power2.out",
        })
        // Hide overlay again
        .set(overlayRef.current, { display: "none" });
    } else if (isAnimating && targetRoute === location.pathname) {
      // If clicking the same route, just end transition immediately
      endTransition();
    }
  }, [isAnimating, targetRoute, navigate, location.pathname, endTransition]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] pointer-events-none hidden"
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          ref={pathRef}
          fill="#1a3a5c"
          d="M 0 100 Q 50 100 100 100 L 100 100 Q 50 100 0 100 Z"
        />
      </svg>
    </div>
  );
}
