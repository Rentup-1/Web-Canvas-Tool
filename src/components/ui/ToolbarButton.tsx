interface ToolbarButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export function ToolbarButton({ label, icon, onClick, className = "" }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition ${className}`}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
