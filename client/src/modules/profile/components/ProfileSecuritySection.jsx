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
      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
    />
  );
}

export default function ProfileSecuritySection({ user }) {
  return (
    <ProfileSectionCard title="Security" actionLabel="Actualizar">
      <div className="space-y-4">
        <Field label="Email">
          <Input value={user?.email || ''} disabled />
        </Field>

        <Field label="Nueva contraseña">
          <Input type="password" placeholder="********" />
        </Field>

        <Field label="Confirmar contraseña">
          <Input type="password" placeholder="********" />
        </Field>
      </div>
    </ProfileSectionCard>
  );
}