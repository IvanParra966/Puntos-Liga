import { useEffect, useState } from 'react';

export default function CreateFolderModal({
  open,
  onClose,
  onSubmit,
  loading,
  parentName,
}) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(name);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
          <form onSubmit={handleSubmit} className="p-6">
            <h3 className="text-xl font-semibold text-white">Nueva carpeta</h3>

            <p className="mt-2 text-sm text-slate-400">
              {parentName
                ? `Se va a crear dentro de: ${parentName}`
                : 'Se va a crear como carpeta principal.'}
            </p>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Nombre
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                placeholder="Ej: 2026"
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-70"
              >
                {loading ? 'Creando...' : 'Crear carpeta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}