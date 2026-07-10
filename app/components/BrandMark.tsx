"use client";

import { useId } from "react";

export function BrandMark() {
  const gradId = useId();
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
      <path
        d="M2 22 C 10 6, 18 28, 30 10"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle className="brand-pulse" cx="21" cy="21.4" r="3" fill="#ffb25e" />
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6bf0c2" />
          <stop offset="1" stopColor="#9d8cff" />
        </linearGradient>
      </defs>
    </svg>
  );
}
