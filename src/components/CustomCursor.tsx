import { useEffect } from "react";

export function CustomCursor() {
  useEffect(() => {
    document.body.style.cursor = "auto";
  }, []);

  return null;
}
