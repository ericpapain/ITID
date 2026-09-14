import { Link, LinkProps } from "react-router-dom";

export function TransitionLink({ to, children, onClick, ...props }: LinkProps) {
  return (
    <Link to={to} onClick={onClick} {...props}>
      {children}
    </Link>
  );
}
