import React from 'react';

export function Stat({ icon, label, value, color }) {
  return (
    <div className="stat">
      <span className={`stat-icon ${color}`}>{icon}</span>
      <div>
        <p>{label}</p>
        <b>${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b>
      </div>
    </div>
  );
}
