import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'sonner';

import { getTournamentRegistrationsBySlug } from '../services/publicTournamentsService';

function formatDate(value) {
    if (!value) return 'Sin definir';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return 'Sin definir';

    return date.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function TournamentRegistrationsPage() {
    const { slug } = useParams();

    const [loading, setLoading] = useState(true);
    const [tournament, setTournament] = useState(null);
    const [registrations, setRegistrations] = useState([]);

    useEffect(() => {
        const loadRegistrations = async () => {
            try {
                setLoading(true);

                const data = await getTournamentRegistrationsBySlug(slug);

                setTournament(data.tournament || null);
                setRegistrations(data.registrations || []);
            } catch (error) {
                console.error('Error loading tournament registrations:', error);
                toast.error(error.message || 'No se pudieron cargar los jugadores registrados');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            loadRegistrations();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
                Cargando jugadores registrados...
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                            Torneo público
                        </p>

                        <h1 className="mt-2 text-3xl font-bold text-white">
                            Jugadores registrados
                        </h1>

                        <p className="mt-2 text-sm text-slate-400">
                            {tournament?.name || 'Torneo'}
                        </p>
                    </div>

                    <Link
                        to={`/tournaments/${slug}`}
                        className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
                    >
                        Volver al torneo
                    </Link>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
                    {registrations.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-slate-950 text-sm">
                                <thead className="border-b border-slate-800 bg-slate-900">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-300">
                                            Jugador
                                        </th>

                                        <th className="px-4 py-3 text-left font-semibold text-slate-300">
                                            Registrado
                                        </th>

                                        <th className="px-4 py-3 text-center font-semibold text-slate-300">
                                            Decklist
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {registrations.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-slate-800 last:border-b-0"
                                        >
                                            <td className="px-4 py-3 text-white">
                                                {item.display_name_snapshot || item.user?.username || 'Sin nombre'}
                                            </td>

                                            <td className="px-4 py-3 text-slate-300">
                                                {formatDate(item.registered_at)}
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex justify-center">
                                                    {item.has_decklist ? (
                                                        <span className="inline-flex items-center justify-center rounded-full bg-emerald-400/15 p-2 text-emerald-300">
                                                            <FiCheck size={16} />
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center justify-center rounded-full bg-rose-400/15 p-2 text-rose-300">
                                                            <FiX size={16} />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-slate-950 p-4 text-sm text-slate-400">
                            Todavía no hay jugadores registrados.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}