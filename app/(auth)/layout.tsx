export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, color-mix(in oklch, var(--primary) 12%, transparent), transparent 60%), radial-gradient(circle at 80% 0%, color-mix(in oklch, var(--primary) 8%, transparent), transparent 55%)",
        }}
      />
      {children}
    </div>
  );
}
