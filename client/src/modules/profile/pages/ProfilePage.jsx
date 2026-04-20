import { useMemo, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import ProfileSidebar from '../components/ProfileSidebar';
import ProfileInfoSection from '../components/ProfileInfoSection';
import ProfileSecuritySection from '../components/ProfileSecuritySection';
import ProfileOrganizeSection from '../components/ProfileOrganizeSection';

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const [profileForm, setProfileForm] = useState({
    first_name: user?.name?.split(' ')[0] || '',
    last_name: user?.name?.split(' ').slice(1).join(' ') || '',
    country_id: '',
    in_game_name: user?.username || '',
  });

  const roleLabel = useMemo(() => {
    if (!user?.role) return 'player';
    return user.role;
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <ProfileSidebar
          user={user}
          roleLabel={roleLabel}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div className="space-y-6">
          {activeTab === 'profile' ? (
            <ProfileInfoSection
              profileForm={profileForm}
              handleProfileChange={handleProfileChange}
            />
          ) : null}

          {activeTab === 'security' ? (
            <ProfileSecuritySection user={user} />
          ) : null}

          {activeTab === 'organize' ? (
            <ProfileOrganizeSection />
          ) : null}
        </div>
      </div>
    </div>
  );
}