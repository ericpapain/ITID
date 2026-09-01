import { Link, LinkProps, useLocation } from "react-router-dom";
import { useTransitionStore } from "../../store/transitionStore";

interface TransitionLinkProps extends LinkProps {
  children: React.ReactNode;
}

export function TransitionLink({ to, children, onClick, ...props }: TransitionLinkProps) {
  const { startTransition } = useTransitionStore();
  const location = useLocation();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let normal Link handle new tabs/windows
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
      if (onClick) onClick(e);
      return;
    }

    const targetStr = typeof to === "string" ? to : to.pathname || "";
    
    // Check if we are already on the same route (ignoring hashes)
    const currentPath = location.pathname;
    const targetPath = targetStr.split("#")[0];

    if (currentPath !== targetPath) {
      e.preventDefault();
      startTransition(targetStr);
    }

    if (onClick) onClick(e);
  };

  return (
    <Link to={to} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
