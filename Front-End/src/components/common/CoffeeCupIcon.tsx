import React from "react";

export const CoffeeCupIcon: React.FC<{ className?: string }> = ({
  className = "w-8 h-8 text-[#7D7265]",
}) => {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 3 hơi nước thẳng đứng phía trên */}
      <line x1="11" y1="6" x2="11" y2="9" />
      <line x1="16" y1="5.5" x2="16" y2="9" />
      <line x1="21" y1="6" x2="21" y2="9" />
      {/* Thân ly bo góc đáy */}
      <path d="M7 11h16v8.5a5.5 5.5 0 0 1-5.5 5.5h-5A5.5 5.5 0 0 1 7 19.5V11z" />
      {/* Quai cầm bên phải */}
      <path d="M23 13.5h2a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3h-2" />
    </svg>
  );
};
