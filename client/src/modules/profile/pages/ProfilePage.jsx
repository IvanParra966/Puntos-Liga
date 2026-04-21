import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../auth/context/AuthContext';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import ProfileSidebar from '../components/ProfileSidebar';
import ProfileInfoSection from '../components/ProfileInfoSection';
import ProfileSecuritySection from '../components/ProfileSecuritySection';
import ProfileOrganizeSection from '../components/ProfileOrganizeSection';
import {
  updateMyPassword,
  updateMyProfile,
} from '../services/profileService';

function buildInitialProfileForm(user) {
  return {
    first_name: user?.name?.split(' ')[0] || '',
    last_name: user?.name?.split(' ').slice(1).join(' ') || '',
    country_id: user?.country_id ? String(user.country_id) : '',
  };
}

function buildInitialSecurityForm() {
  return {
    current_password: '',
    new_password: '',
    confirm_password: '',
  };
}

export default function ProfilePage() {
  const { user, token, refreshMe } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [pendingTab, setPendingTab] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileForm, setProfileForm] = useState(buildInitialProfileForm(user));
  const [securityForm, setSecurityForm] = useState(buildInitialSecurityForm());

  const initialProfileForm = useMemo(() => buildInitialProfileForm(user), [user]);
  const initialSecurityForm = useMemo(() => buildInitialSecurityForm(), []);

  useEffect(() => {
    setProfileForm(initialProfileForm);
  }, [initialProfileForm]);

  const isProfileDirty = useMemo(() => {
    return JSON.stringify(profileForm) !== JSON.stringify(initialProfileForm);
  }, [profileForm, initialProfileForm]);

  const isSecurityDirty = useMemo(() => {
    return JSON.stringify(securityForm) !== JSON.stringify(initialSecurityForm);
  }, [securityForm, initialSecurityForm]);

  const roleLabel = useMemo(() => user?.role || 'player', [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);

      await updateMyProfile(
        {
          first_name: profileForm.first_name,
          last_name: profileForm.last_name,
          country_id: profileForm.country_id ? Number(profileForm.country_id) : null,
        },
        token
      );

      await refreshMe();
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'No se pudo actualizar el perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    try {
      setSavingPassword(true);

      await updateMyPassword(
        {
          current_password: securityForm.current_password,
          new_password: securityForm.new_password,
          confirm_password: securityForm.confirm_password,
        },
        token
      );

      setSecurityForm(buildInitialSecurityForm());
      toast.success('Contraseña actualizada correctamente');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'No se pudo actualizar la contraseña');
    } finally {
      setSavingPassword(false);
    }
  };

  const hasUnsavedChanges =
    (activeTab === 'profile' && isProfileDirty) ||
    (activeTab === 'security' && isSecurityDirty);

  const handleTabChange = (nextTab) => {
    if (nextTab === activeTab) return;

    if (hasUnsavedChanges) {
      setPendingTab(nextTab);
      setConfirmOpen(true);
      return;
    }

    setActiveTab(nextTab);
  };

  const handleConfirmTabChange = () => {
    if (pendingTab) {
      setActiveTab(pendingTab);
    }

    setPendingTab(null);
    setConfirmOpen(false);
  };

  const handleCancelTabChange = () => {
    setPendingTab(null);
    setConfirmOpen(false);
  };

  return (
    <>
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <ProfileSidebar
            user={user}
            roleLabel={roleLabel}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          <div className="space-y-6">
            {activeTab === 'profile' ? (
              <ProfileInfoSection
                user={user}
                profileForm={profileForm}
                handleProfileChange={handleProfileChange}
                onSave={handleSaveProfile}
                saving={savingProfile}
                isDirty={isProfileDirty}
              />
            ) : null}

            {activeTab === 'security' ? (
              <ProfileSecuritySection
                user={user}
                securityForm={securityForm}
                handleSecurityChange={handleSecurityChange}
                onSave={handleSavePassword}
                saving={savingPassword}
                isDirty={isSecurityDirty}
              />
            ) : null}

            {activeTab === 'organize' ? <ProfileOrganizeSection /> : null}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Tenés cambios sin guardar"
        description="Si cambiás de pestaña ahora, vas a perder los cambios que hiciste."
        confirmText="Salir igual"
        cancelText="Seguir editando"
        onConfirm={handleConfirmTabChange}
        onCancel={handleCancelTabChange}
      />
    </>
  );
}