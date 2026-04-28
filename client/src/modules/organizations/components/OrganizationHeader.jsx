import { FiEdit2 } from 'react-icons/fi';

function OrganizationLogo({ name, imageUrl, onPickImage, uploadingLogo }) {
  const initial = name?.charAt(0)?.toUpperCase() || 'O';

  return (
    <div className="relative shrink-0">
      <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-lg shadow-black/20 sm:h-32 sm:w-32 md:h-36 md:w-36">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-4xl font-bold text-cyan-300 sm:text-5xl">
            {initial}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onPickImage}
        disabled={uploadingLogo}
        className="absolute bottom-1 right-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 shadow-lg transition hover:border-cyan-400 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
        title={uploadingLogo ? 'Subiendo logo...' : 'Editar logo'}
      >
        <FiEdit2 size={16} />
      </button>

      {uploadingLogo ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-slate-950/55 backdrop-blur-[1px]">
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-white">
            Subiendo...
          </span>
        </div>
      ) : null}
    </div>
  );
}

function RoleBadge({ roleName }) {
  return (
    <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
      {roleName || 'Sin rol'}
    </span>
  );
}

export default function OrganizationHeader({
  organization,
  membership,
  logoPreview,
  onPickLogo,
  uploadingLogo,
}) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[auto,minmax(0,1fr)] sm:items-center sm:gap-6">
        <div className="flex justify-center sm:justify-start">
          <OrganizationLogo
            name={organization.name}
            imageUrl={logoPreview}
            onPickImage={onPickLogo}
            uploadingLogo={uploadingLogo}
          />
        </div>

        <div className="min-w-0 text-center sm:text-left">
          <div className="mb-3 flex justify-center sm:justify-start">
            <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-300">
              Organización
            </span>
          </div>

          <h1 className="break-words font-storm text-4xl leading-none text-[#5aff5e] sm:text-5xl md:text-6xl">
            {organization.name}
          </h1>

          <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
            <p className="text-sm text-slate-400">Tu rol actual:</p>
            <RoleBadge
              roleName={membership?.organization_role?.name || 'Sin rol'}
            />
          </div>
        </div>
      </div>
    </section>
  );
}