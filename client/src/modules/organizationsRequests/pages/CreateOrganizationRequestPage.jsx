import { useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { createOrganizationRequest } from '../services/organizationRequestsService';

export default function CreateOrganizationRequestPage() {
  const { token } = useAuth();

  const [form, setForm] = useState({
    request_type: 'create_organization',
    organization_id: '',
    organization_name_requested: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        request_type: form.request_type,
        organization_id:
          form.request_type === 'become_organizer' && form.organization_id
            ? Number(form.organization_id)
            : null,
        organization_name_requested:
          form.request_type === 'create_organization'
            ? form.organization_name_requested
            : null,
        message: form.message,
      };

      await createOrganizationRequest(payload, token);

      setSuccess('Solicitud enviada correctamente');
      setForm({
        request_type: 'create_organization',
        organization_id: '',
        organization_name_requested: '',
        message: '',
      });
    } catch (err) {
      setError(err.message || 'No se pudo enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h1 className="text-2xl font-bold text-white">Nueva solicitud</h1>
      <p className="mt-2 text-sm text-slate-400">
        Pedí crear una organización o solicitá ser organizador.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-300">Tipo de solicitud</label>
          <select
            name="request_type"
            value={form.request_type}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
          >
            <option value="create_organization">Crear organización</option>
            <option value="become_organizer">Ser organizador</option>
          </select>
        </div>

        {form.request_type === 'create_organization' ? (
          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Nombre de la organización
            </label>
            <input
              type="text"
              name="organization_name_requested"
              value={form.organization_name_requested}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
              placeholder="Vortex TCG Catamarca"
            />
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-sm text-slate-300">ID de organización</label>
            <input
              type="number"
              name="organization_id"
              value={form.organization_id}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
              placeholder="1"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm text-slate-300">Mensaje</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
            placeholder="Contanos por qué querés este permiso"
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-70"
        >
          {loading ? 'Enviando...' : 'Enviar solicitud'}
        </button>
      </form>
    </div>
  );
}