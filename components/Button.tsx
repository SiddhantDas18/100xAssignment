import Link from "next/link";

interface ButtonProps {
  text: string;
  link?: string;
  type: 'primary' | 'secondary';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const Button = ({ text, link, type, className, onClick, disabled, isLoading }: ButtonProps) => {
  const baseClasses = "px-6 py-3 rounded-md font-medium transition-all";
  const primaryClasses = "bg-gradient-to-b from-[#5fa3f8] to-[#1d4ed8] text-white hover:from-[#4a90e2] hover:to-[#1a44b8]";
  const secondaryClasses = "bg-[#111927] text-white hover:bg-[#1f2937]";
  const disabledClasses = "opacity-50 cursor-not-allowed";

  const buttonContent = (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${type === 'primary' ? primaryClasses : secondaryClasses} ${disabled ? disabledClasses : ''} ${className || ''}`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
          Loading...
        </div>
      ) : (
        text
      )}
    </button>
  );

  if (link) {
    return <Link href={link}>{buttonContent}</Link>;
  }

  return buttonContent;
};

export default Button;