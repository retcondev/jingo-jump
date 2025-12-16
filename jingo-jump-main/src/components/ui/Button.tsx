import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const variants = {
  primary:
    "bg-primary-500 text-white shadow-lg hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-xl active:scale-95",
  secondary:
    "bg-gray-900 text-white shadow-lg hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-xl active:scale-95",
  outline:
    "border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-900 hover:bg-gray-900 hover:text-white",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  danger:
    "bg-red-500 text-white shadow-lg hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-xl active:scale-95",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-6 py-3.5 text-base gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      icon,
      iconPosition = "left",
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled ?? loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center rounded-xl font-semibold
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon && iconPosition === "left" ? (
          icon
        ) : null}
        {children}
        {!loading && icon && iconPosition === "right" ? icon : null}
      </button>
    );
  }
);

Button.displayName = "Button";
