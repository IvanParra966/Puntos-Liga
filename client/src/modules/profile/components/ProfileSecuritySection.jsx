import ProfileSectionCard from './ProfileSectionCard';

function Field({ label, children, description }) {
  return (
    <div className="grid gap-2 md:grid-cols-[180px_minmax(0,1fr)] md:items-start">
      <div>
        <label className="text-sm font-semibold text-slate-200">{label}</label>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        ) : null}
      </div>

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

export default function ProfileSecuritySection({
  securityForm,
  handleSecurityChange,
  onSave,
  saving,
  isDirty,
}) {
  return (
    <ProfileSectionCard
      title="Seguridad"
      description="Actualizá tu contraseña de acceso a la cuenta."
      actionLabel={saving ? 'Actualizando...' : 'Actualizar contraseña'}
      onAction={onSave}
      actionDisabled={saving || !isDirty}
    >
      <div className="space-y-4">
        <Field
          label="Contraseña actual"
          description="Ingresá tu contraseña actual para confirmar el cambio."
        >
          <Input
            type="password"
            name="current_password"
            value={securityForm.current_password}
            onChange={handleSecurityChange}
            placeholder="Ingresá tu contraseña actual"
          />
        </Field>

        <Field
          label="Nueva contraseña"
          description="Usá una contraseña de al menos 6 caracteres."
        >
          <Input
            type="password"
            name="new_password"
            value={securityForm.new_password}
            onChange={handleSecurityChange}
            placeholder="Mínimo 6 caracteres"
          />
        </Field>

        <Field
          label="Confirmar contraseña"
          description="Repetí la nueva contraseña exactamente igual."
        >
          <Input
            type="password"
            name="confirm_password"
            value={securityForm.confirm_password}
            onChange={handleSecurityChange}
            placeholder="Repetí la nueva contraseña"
          />
        </Field>
      </div>
    </ProfileSectionCard>
  );
}