import { useState, useEffect, useRef } from "react";
import { useInView } from "framer-motion";

export function useTypewriter(fullText: string, speed: number = 80, delay: number = 400) {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (!isInView) return;
    
    let timeout: ReturnType<typeof setTimeout>;
    let i = 0;
    const type = () => {
      if (i < fullText.length) {
        setDisplayedText(fullText.substring(0, i + 1));
        i++;
        timeout = setTimeout(type, speed);
      }
    };
    timeout = setTimeout(type, delay);
    return () => clearTimeout(timeout);
  }, [isInView, fullText, speed, delay]);

  return { displayedText, showCursor, ref };
}
