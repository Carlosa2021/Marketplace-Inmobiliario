'use client';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: Props) {
  return (
    <div className={`bg-white rounded-2xl shadow p-2 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: Props) {
  return <div className={className}>{children}</div>;
}

export function CardHeader({ children, className }: Props) {
  return <div className={`p-4 ${className || ''}`}>{children}</div>;
}

export function CardTitle({ children, className }: Props) {
  return (
    <h3 className={`text-lg font-semibold ${className || ''}`}>{children}</h3>
  );
}
