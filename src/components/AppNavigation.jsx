import {
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Plus,
  Settings,
  Tag,
  Target,
  WalletCards,
} from 'lucide-react';

const sidebarItems = [
  [LayoutDashboard, 'Overview'],
  [ArrowUpRight, 'Transactions'],
  [WalletCards, 'Accounts'],
  [Target, 'Budgets'],
  [BarChart3, 'Reports'],
];

const mobileItems = [
  [LayoutDashboard, 'Overview'],
  [ArrowUpRight, 'Transactions'],
  [Plus, 'Add'],
  [Target, 'Budgets'],
];

export function AppNavigation({ active, onNavigate, onManage, onAddTransaction }) {
  return (
    <>
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">p</span><span>Pennywise</span></div>
        <div className="workspace">
          <span className="avatar">AJ</span>
          <div><b>Alex Johnson</b><small>Personal workspace</small></div>
          <ChevronDown size={15} />
        </div>
        <nav>
          {sidebarItems.map(([Icon, label]) => (
            <button
              className={active === label ? 'nav-active' : ''}
              onClick={() => label === 'Accounts' ? onManage('accounts') : onNavigate(label)}
              key={label}
            >
              <Icon size={19} />{label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button onClick={() => onManage('categories')}><Tag size={18} />Categories</button>
          <button onClick={() => onManage('accounts')}><WalletCards size={18} />Accounts</button>
          <button><Settings size={18} />Settings</button>
          <div className="upgrade">
            <span>✦</span>
            <div><b>Unlock more</b><small>Get Pennywise Pro</small></div>
            <ChevronRight size={15} />
          </div>
        </div>
      </aside>
      <nav className="mobile-nav">
        {mobileItems.map(([Icon, label]) => (
          <button
            key={label}
            className={active === label ? 'active' : ''}
            onClick={() => label === 'Add' ? onAddTransaction() : onNavigate(label)}
          >
            <Icon size={19} /><span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
