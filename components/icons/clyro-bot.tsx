interface ClyroBotProps {
  className?: string;
}

export const ClyroBot = ({ className }: ClyroBotProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 3.6v2" />
    <circle cx="12" cy="2.4" r="1.2" fill="currentColor" stroke="none" />
    <rect x="3.5" y="5.6" width="17" height="13" rx="4.6" />
    <path d="M1.6 11v3" />
    <path d="M22.4 11v3" />
    <circle cx="9.1" cy="11.2" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="14.9" cy="11.2" r="1.15" fill="currentColor" stroke="none" />
    <path d="M9.6 14.9c1.5 1.05 3.3 1.05 4.8 0" />
  </svg>
);
