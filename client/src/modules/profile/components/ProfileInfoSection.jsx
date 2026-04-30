import { useEffect, useState } from 'react';
import { getCountries } from '../../countries/services/countriesService';
import ProfileSectionCard from './ProfileSectionCard';

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
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
      title="Información personal"
      description="Actualizá tu nombre, apellido y país para mantener tu perfil listo para torneos e inscripciones."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Username">
          <Input value={user?.username || ''} disabled />
        </Field>

        <Field label="Email">
          <Input value={user?.email || ''} disabled />
        </Field>

        <Field label="Nombre">
          <Input
            type="text"
            name="first_name"
            value={profileForm.first_name}
            onChange={handleProfileChange}
            placeholder="Tu nombre"
          />
        </Field>

        <Field label="Apellido">
          <Input
            type="text"
            name="last_name"
            value={profileForm.last_name}
            onChange={handleProfileChange}
            placeholder="Tu apellido"
          />
        </Field>

        <div className="md:col-span-2">
          <Field label="País">
            <Select
              name="country_id"
              value={profileForm.country_id}
              onChange={handleProfileChange}
            >
              <option value="">
                {loadingCountries ? 'Cargando países...' : 'Seleccionar país'}
              </option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !isDirty}
          className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-70"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </ProfileSectionCard>
  );
}