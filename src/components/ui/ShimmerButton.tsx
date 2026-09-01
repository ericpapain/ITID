import React from "react";
import { Link } from "react-router-dom";
import { TransitionLink } from "./TransitionLink";

export interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: 'button' | 'a' | 'Link';
  href?: string;
  to?: string;
  className?: string;
  children: React.ReactNode;
  target?: string;
  rel?: string;
  onClick?: (e?: any) => void;
}

export function ShimmerButton({
  as = 'button',
  children,
  className = "",
  ...props
}: ShimmerButtonProps) {
  // Base classes that keep the application's aesthetic while adding the shimmer effect structure
  // Adjusted padding and font weight to match ITID's premium feel. 
  const hasPadding = className.includes('px-') || className.includes('py-') || className.includes('p-');
  const baseClasses = `group relative inline-flex items-center justify-center overflow-hidden rounded-full ${hasPadding ? '' : 'px-8 py-4'} text-sm font-bold text-white transition-transform duration-200 active:scale-[0.97] hover:shadow-[0_0_40px_rgba(42,157,143,0.4)]`;
  
  const mergedClasses = `${baseClasses} ${className.includes('bg-') ? '' : 'bg-[#2a9d8f]'} ${className}`;

  const innerContent = (
    <>
      <span
        className="pointer-events-none absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.35),55%,transparent)] bg-[length:200%_100%]"
        aria-hidden
      />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </>
  );

  if (as === 'a') {
    return (
      <a className={mergedClasses} href={props.href} target={props.target} rel={props.rel} onClick={props.onClick} style={props.style}>
        {innerContent}
      </a>
    );
  }

  if (as === 'Link') {
    return (
      <TransitionLink to={props.to || "#"} className={mergedClasses} onClick={props.onClick as any} style={props.style}>
        {innerContent}
      </TransitionLink>
    );
  }

  return (
    <button className={mergedClasses} {...props}>
      {innerContent}
    </button>
  );
}
