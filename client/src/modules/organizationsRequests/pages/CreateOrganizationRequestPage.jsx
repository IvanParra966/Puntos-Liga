import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../auth/context/AuthContext';
import { createOrganizationRequest } from '../services/organizationRequestsService';

export default function CreateOrganizationRequestPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState({
    organization_name_requested: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createOrganizationRequest(
        {
          organization_name_requested: form.organization_name_requested,
          message: form.message,
        },
        token
      );

      toast.success('Solicitud enviada correctamente');
      navigate('/profile');
    } catch (err) {
      toast.error(err.message || 'No se pudo enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h1 className="text-2xl font-bold text-white">Ser organizador</h1>

      <p className="mt-2 text-sm text-slate-400">
        Enviá tu solicitud para acceder a la gestión de torneos dentro de la plataforma.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Nombre de la organización
          </label>

          <input
            type="text"
            name="organization_name_requested"
            value={form.organization_name_requested}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            placeholder="Nombre de tu grupo"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Mensaje
          </label>

          <textarea
            rows={5}
            name="message"
            value={form.message}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            placeholder="Contanos por qué querés ser organizador"
          />
        </div>

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