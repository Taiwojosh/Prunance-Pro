import React from 'react';

export default function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="1024" rx="220" fill="#3B82F6"/>
      <path d="M320 280H580C680 280 750 350 750 450C750 550 680 620 580 620H320V800" stroke="white" strokeWidth="80" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M720 250L750 200L780 250L830 280L780 310L750 360L720 310L670 280L720 250Z" fill="#FDE047">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}
