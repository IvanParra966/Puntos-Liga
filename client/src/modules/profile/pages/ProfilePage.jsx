import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import ProfileSidebar from '../components/ProfileSidebar';
import ProfileInfoSection from '../components/ProfileInfoSection';
import ProfileSecuritySection from '../components/ProfileSecuritySection';
import ProfileOrganizeSection from '../components/ProfileOrganizeSection';
import { updateMyProfile } from '../services/profileService';

export default function ProfilePage() {
  const { user, token, refreshMe } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    country_id: '',
    in_game_name: '',
  });

  useEffect(() => {
    setProfileForm({
      first_name: user?.name?.split(' ')[0] || '',
      last_name: user?.name?.split(' ').slice(1).join(' ') || '',
      country_id: user?.country_id ? String(user.country_id) : '',
      in_game_name: user?.username || '',
    });
  }, [user]);

  const roleLabel = useMemo(() => user?.role || 'player', [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      await updateMyProfile(
        {
          first_name: profileForm.first_name,
          last_name: profileForm.last_name,
          country_id: profileForm.country_id ? Number(profileForm.country_id) : null,
          in_game_name: profileForm.in_game_name,
        },
        token
      );

      await refreshMe();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(error.message || 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
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
              onSave={handleSaveProfile}
              saving={saving}
            />
          ) : null}

          {activeTab === 'security' ? (
            <ProfileSecuritySection user={user} />
          ) : null}

          {activeTab === 'organize' ? <ProfileOrganizeSection /> : null}
        </div>
      </div>
    </div>
  );
}