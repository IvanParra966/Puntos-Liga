import { FiLock, FiSettings, FiUser } from 'react-icons/fi';
import UserAvatar from './UserAvatar';

const tabs = [
  { key: 'profile', label: 'Perfil', icon: FiUser },
  { key: 'security', label: 'Seguridad', icon: FiLock },
  { key: 'organize', label: 'Organizar', icon: FiSettings },
];

function getDisplayName(user) {
  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
  return fullName || user?.username || 'Usuario';
}

export default function ProfileSidebar({ user, roleLabel, activeTab, onTabChange }) {
  return (
    <aside className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <UserAvatar user={user} />

        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-white">
            {getDisplayName(user)}
          </p>
          <p className="truncate text-sm text-slate-400">
            {user?.email || 'Sin email'}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
            {roleLabel}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}