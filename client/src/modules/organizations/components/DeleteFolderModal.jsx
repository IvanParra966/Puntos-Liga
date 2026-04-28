export default function DeleteFolderModal({
  open,
  password,
  loading,
  onPasswordChange,
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
          <h3 className="text-xl font-semibold text-white">Eliminar carpeta</h3>
          <p className="mt-2 text-sm text-slate-400">
            Esta eliminación es lógica. La carpeta no se borra físicamente, pero se ocultará del sistema.
          </p>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Confirmá con tu contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              placeholder="Ingresá tu contraseña"
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
              type="button"
              onClick={onConfirm}
              disabled={loading || !password}
              className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-70"
            >
              {loading ? 'Eliminando...' : 'Eliminar carpeta'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}