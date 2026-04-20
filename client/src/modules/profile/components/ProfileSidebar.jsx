import { FiLock, FiSettings, FiUser } from 'react-icons/fi';
import UserAvatar from './UserAvatar';

const tabs = [
  { key: 'profile', label: 'Perfil', icon: FiUser },
  { key: 'security', label: 'Seguridad', icon: FiLock },
  { key: 'organize', label: 'Organizar', icon: FiSettings },
];

export default function ProfileSidebar({ user, roleLabel, activeTab, setActiveTab }) {
  return (
    <aside className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
      <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {user?.username || 'Usuario'}
            </p>
            <p className="truncate text-xs text-slate-400">
              {user?.email || 'Sin email'}
            </p>
            <div className="mt-2 inline-flex rounded-lg border border-slate-700 px-2 py-1 text-[11px] uppercase tracking-wide text-slate-300">
              {roleLabel}
            </div>
          </div>
        </div>
      </div>

      <nav className="space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}