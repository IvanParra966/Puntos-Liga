import { useEffect, useState } from 'react';
import { getCountries } from '../../countries/services/countriesService';
import ProfileSectionCard from './ProfileSectionCard';

function Field({ label, children }) {
  return (
    <div className="grid gap-2 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
      <label className="text-sm font-semibold text-slate-200">{label}</label>
      {children}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
    />
  );
}

export default function ProfileInfoSection({
  user,
  profileForm,
  handleProfileChange,
  onSave,
  saving,
  isDirty,
}) {
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await getCountries();
        setCountries(data.countries || []);
      } catch (error) {
        console.error('Error loading countries:', error);
      } finally {
        setLoadingCountries(false);
      }
    };

    run();
  }, []);

  return (
    <ProfileSectionCard
      title="Player Information"
      actionLabel={saving ? 'Guardando...' : 'Actualizar'}
      onAction={onSave}
      actionDisabled={saving || !isDirty}
    >
      <div className="space-y-4">
        <Field label="Username">
          <Input value={user?.username || ''} disabled />
        </Field>

        <Field label="First name">
          <Input
            name="first_name"
            value={profileForm.first_name}
            onChange={handleProfileChange}
          />
        </Field>

        <Field label="Last name">
          <Input
            name="last_name"
            value={profileForm.last_name}
            onChange={handleProfileChange}
          />
        </Field>

        <Field label="Country">
          <Select
            name="country_id"
            value={profileForm.country_id}
            onChange={handleProfileChange}
            disabled={loadingCountries}
          >
            <option value="">
              {loadingCountries ? 'Cargando países...' : 'Seleccionar país'}
            </option>
            {countries.map((country) => (
              <option key={country.id} value={String(country.id)}>
                {country.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Email">
          <Input value={user?.email || ''} disabled />
        </Field>
      </div>
    </ProfileSectionCard>
  );
}