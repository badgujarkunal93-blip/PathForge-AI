export default function GlassCard({ children, className = '', aos = true, ...props }) {
  return (
    <div
      className={`glass-card rounded-card border border-[rgba(0,212,255,0.15)] bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-[12px] ${className}`}
      data-aos={aos ? props['data-aos'] || 'fade-up' : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
