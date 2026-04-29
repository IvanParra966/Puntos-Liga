import { useEffect, useState } from 'react';

export default function EditFolderNameModal({
  open,
  currentName,
  loading,
  onClose,
  onConfirm,
}) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (open) {
      setValue(currentName || '');
    }
  }, [open, currentName]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    await onConfirm(value.trim());
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[90] bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white">Editar nombre</h2>
          <p className="mt-2 text-sm text-slate-400">
            Cambiá el nombre de la carpeta seleccionada.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Nombre de la carpeta
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                placeholder="Nombre"
                autoFocus
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading || !value.trim()}
                className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-70"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}