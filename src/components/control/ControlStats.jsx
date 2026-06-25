const StatCard = ({ label, value, color }) => (
  <div className="ctrl-stat-card">
    <span className={`ctrl-stat-value ${color || ''}`}>{value}</span>
    <span className="ctrl-stat-label">{label}</span>
  </div>
);

const ControlStats = ({ items }) => (
  <div className="ctrl-stats">
    {items.map((item) => (
      <StatCard
        key={item.label}
        label={item.label}
        value={item.value}
        color={item.color}
      />
    ))}
  </div>
);

export default ControlStats;
