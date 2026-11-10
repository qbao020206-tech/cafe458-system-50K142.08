import React from "react";

export const EmptyClipboardIcon: React.FC<{ className?: string }> = ({
  className = "w-12 h-14 text-[#666666]",
}) => {
  return (
    <svg
      className={className}
      viewBox="0 0 48 56"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Thân bảng kẹp */}
      <rect x="8" y="10" width="32" height="42" rx="6" />
      {/* Kẹp trên đầu */}
      <path d="M18 10V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
      {/* Dòng 1: chấm và vạch */}
      <circle cx="16" cy="22" r="1" fill="currentColor" stroke="none" />
      <line x1="21" y1="22" x2="32" y2="22" />
      {/* Dòng 2: chấm và vạch */}
      <circle cx="16" cy="30" r="1" fill="currentColor" stroke="none" />
      <line x1="21" y1="30" x2="32" y2="30" />
      {/* Dòng 3: chấm và vạch */}
      <circle cx="16" cy="38" r="1" fill="currentColor" stroke="none" />
      <line x1="21" y1="38" x2="32" y2="38" />
    </svg>
  );
};
