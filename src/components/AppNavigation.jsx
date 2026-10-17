import { useRef } from 'react';
import {
  ArrowUpRight,
  BarChart3,
  LayoutDashboard,
  Menu,
  Settings,
  Tag,
  Target,
  WalletCards,
} from 'lucide-react';

const navigationItems = [
  [LayoutDashboard, 'Overview'],
  [ArrowUpRight, 'Transactions'],
  [WalletCards, 'Accounts'],
  [Target, 'Budgets'],
  [BarChart3, 'Reports'],
];

export function AppNavigation({ active, onNavigate, onManage }) {
  const menuRef = useRef(null);

  const select = action => {
    action();
    if (menuRef.current) menuRef.current.open = false;
  };

  return (
    <details className="nav-dropdown" ref={menuRef}>
      <summary aria-label="Open navigation menu" title="Navigation menu">
        <Menu size={20} />
      </summary>
      <div className="nav-dropdown-panel">
        <div className="brand"><span className="brand-mark">p</span><span>Pennywise</span></div>
        <nav aria-label="Main navigation">
          {navigationItems.map(([Icon, label]) => (
            <button
              key={label}
              className={active === label ? 'nav-active' : ''}
              onClick={() => select(() => label === 'Accounts' ? onManage('accounts') : onNavigate(label))}
            >
              <Icon size={18} />{label}
            </button>
          ))}
        </nav>
        <div className="nav-dropdown-divider" />
        <button onClick={() => select(() => onManage('categories'))}><Tag size={17} />Categories</button>
        <button onClick={() => select(() => onManage('accounts'))}><WalletCards size={17} />Manage accounts</button>
        <button onClick={() => select(() => onNavigate('Settings'))}><Settings size={17} />Settings</button>
      </div>
    </details>
  );
}
