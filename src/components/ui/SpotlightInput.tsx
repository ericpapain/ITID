import { useId, useState } from "react";
import { type LucideIcon } from "lucide-react";

export function SpotlightInput({
  label,
  type = "text",
  icon: Icon,
  className = "",
  value,
  onChange,
  required = false,
}: {
  label: string;
  type?: string;
  icon?: LucideIcon;
  className?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-xs font-semibold text-[#1a3a5c]/85">
        {label} {required && <span className="text-[#2a9d8f]">*</span>}
      </label>
      <div
        className={`relative flex items-center rounded-xl bg-white transition-all duration-200 border ${
          focused
            ? "border-[#2a9d8f] ring-2 ring-[#2a9d8f]/20 shadow-md"
            : "border-slate-300 hover:border-slate-400 shadow-sm"
        }`}
      >
        {Icon && (
          <div className="pl-3.5 pr-1 flex items-center pointer-events-none">
            <Icon
              className={`w-4 h-4 transition-colors duration-200 ${
                focused ? "text-[#2a9d8f]" : "text-slate-400"
              }`}
            />
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          required={required}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={label}
          className="w-full py-3 px-3 text-sm text-[#1a3a5c] font-medium bg-transparent outline-none placeholder:text-slate-400 placeholder:font-normal"
        />
      </div>
    </div>
  );
}
