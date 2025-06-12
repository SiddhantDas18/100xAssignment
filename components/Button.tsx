import Link from "next/link";

interface ButtonProps {
  text: string;
  link: string;
  type: 'primary' | 'secondary';
  className?: string;
}

const Button = ({ text, link, type, className }: ButtonProps) => {
  const baseClasses = "px-6 py-3 rounded-md font-medium w-full";
  const primaryClasses = "bg-gradient-to-b from-[#5fa3f8] to-[#1d4ed8] text-white";
  const secondaryClasses = "bg-[#111927] text-white";

  return (
    <Link href={link} className={className}>
      <button
        className={`${baseClasses} ${type === 'primary' ? primaryClasses : secondaryClasses}`}
      >
        {text}
      </button>
    </Link>
  );
};

export default Button;