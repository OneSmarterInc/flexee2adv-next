// Reusable Card component
export function Card({ children, className = "", theme }) {
  return (
    <div className={`${theme.card} border rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}

export function CardInner({ children, className = "", theme }) {
  return (
    <div className={`p-4 rounded-lg ${theme.cardInner} ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, icon }) {
  return (
    <h3 className="font-semibold mb-4 flex items-center gap-2">
      <span>{icon}</span>
      {children}
    </h3>
  );
}