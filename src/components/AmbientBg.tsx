export function AmbientBg() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-ink" />
      <div className="absolute inset-0 bg-grid bg-grid opacity-60" />
      <div
        className="absolute left-1/2 top-[-12%] h-[520px] w-[720px] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(245,154,42,0.22) 0%, rgba(245,154,42,0.06) 40%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(245,154,42,0.1) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
