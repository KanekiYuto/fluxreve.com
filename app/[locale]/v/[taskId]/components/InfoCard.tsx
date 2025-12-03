interface InfoCardProps {
  label: string;
  value: string;
  fullWidth?: boolean;
}

export default function InfoCard({ label, value, fullWidth = false }: InfoCardProps) {
  return (
    <div className={`${fullWidth ? 'col-span-2' : ''} bg-surface-secondary rounded-xl p-3 border border-border/50`}>
      <div className="text-xs text-text-muted uppercase tracking-wide mb-1.5">{label}</div>
      <div className="text-base text-white font-semibold">{value}</div>
    </div>
  );
}
