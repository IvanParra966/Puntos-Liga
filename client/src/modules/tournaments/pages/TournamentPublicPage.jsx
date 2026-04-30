import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiCalendar,
  FiCheck,
  FiClipboard,
  FiLock,
  FiMapPin,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { toast } from 'sonner';
import { useAuth } from '../../auth/context/AuthContext';
import {
  getMyTournamentDecklist,
  getMyTournamentRegistration,
  getPublicTournamentBySlug,
  registerToTournament,
  unregisterFromTournament,
} from '../services/publicTournamentsService';

function formatDate(value) {
  if (!value) return 'Sin definir';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
          <Icon size={18} />
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-sm font-medium text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function getRegistrationStatusText(tournament) {
  if (tournament?.registration_available) {
    return 'Disponible';
  }

  return tournament?.registration_message || 'No disponible';
}

export default function TournamentPublicPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState(null);
  const [registrationCode, setRegistrationCode] = useState('');
  const [registering, setRegistering] = useState(false);
  const [unregistering, setUnregistering] = useState(false);
  const [myRegistration, setMyRegistration] = useState(null);
  const [myDecklist, setMyDecklist] = useState(null);
  const [checkingRegistration, setCheckingRegistration] = useState(false);

  const loadTournament = async () => {
    const data = await getPublicTournamentBySlug(slug);
    setTournament(data.tournament);
    return data.tournament;
  };

  const loadMyRegistration = async (tournamentId) => {
    if (!token || !tournamentId) {
      setMyRegistration(null);
      return null;
    }

    const data = await getMyTournamentRegistration(tournamentId, token);
    setMyRegistration(data.registration || null);
    return data.registration || null;
  };

  const loadMyDecklist = async (tournamentId) => {
    if (!token || !tournamentId) {
      setMyDecklist(null);
      return null;
    }

    try {
      const data = await getMyTournamentDecklist(tournamentId, token);
      setMyDecklist(data.decklist || null);
      return data.decklist || null;
    } catch (error) {
      setMyDecklist(null);
      return null;
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);

        const loadedTournament = await loadTournament();

        if (token && loadedTournament?.id) {
          try {
            setCheckingRegistration(true);
            await Promise.all([
              loadMyRegistration(loadedTournament.id),
              loadMyDecklist(loadedTournament.id),
            ]);
          } catch (error) {
            console.error('Error loading tournament user state:', error);
          } finally {
            setCheckingRegistration(false);
          }
        } else {
          setMyRegistration(null);
          setMyDecklist(null);
        }
      } catch (error) {
        console.error('Error loading public tournament:', error);
        toast.error(error.message || 'No se pudo cargar el torneo');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      run();
    }
  }, [slug, token]);

  const needsCode = useMemo(() => {
    const code = tournament?.registrationMode?.code;
    return code === 'shared_code' || code === 'single_use_code';
  }, [tournament]);

  const isRegistered = myRegistration?.registration_status === 'registered';
  const hasMyDecklist = !!myDecklist;

  const handleRegister = async () => {
    if (!tournament?.id) return;

    if (!token) {
      toast.error('Tenés que iniciar sesión para registrarte');
      navigate('/login');
      return;
    }

    try {
      setRegistering(true);

      await registerToTournament(
        tournament.id,
        {
          registration_code: registrationCode,
        },
        token
      );

      const refreshedTournament = await loadTournament();
      await Promise.all([
        loadMyRegistration(refreshedTournament.id),
        loadMyDecklist(refreshedTournament.id),
      ]);

      toast.success('Te registraste correctamente');
    } catch (error) {
      console.error('Error registering to tournament:', error);
      toast.error(error.message || 'No te pudiste registrar');
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!tournament?.id || !token) return;

    try {
      setUnregistering(true);

      await unregisterFromTournament(tournament.id, token);

      const refreshedTournament = await loadTournament();
      await Promise.all([
        loadMyRegistration(refreshedTournament.id),
        loadMyDecklist(refreshedTournament.id),
      ]);

      toast.success('Tu inscripción fue cancelada');
    } catch (error) {
      console.error('Error unregistering from tournament:', error);
      toast.error(error.message || 'No se pudo cancelar la inscripción');
    } finally {
      setUnregistering(false);
    }
  };

  const handleOpenDecklist = () => {
    navigate(`/tournaments/${tournament.slug}/decklist`);
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
        Cargando torneo...
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-2xl font-bold text-white">Torneo</h1>
        <p className="mt-3 text-sm text-slate-400">
          No se encontró el torneo.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8">
        <div className="mb-3 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
          Torneo público
        </div>

        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          {tournament.name}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Información del torneo, inscripción y detalles para los jugadores.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            icon={FiMapPin}
            label="Modalidad"
            value={tournament.event_mode === 'online' ? 'Online' : 'Presencial'}
          />

          <InfoCard
            icon={FiClipboard}
            label="Formato"
            value={tournament.format?.name || 'Sin formato'}
          />

          <InfoCard
            icon={FiUsers}
            label="Jugadores"
            value={
              tournament.player_limit_enabled && tournament.max_players
                ? `${tournament.registrations_count} / ${tournament.max_players}`
                : `${tournament.registrations_count}`
            }
          />

          <InfoCard
            icon={FiCalendar}
            label="Inicio"
            value={formatDate(tournament.starts_at)}
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-white">Descripción</h2>

          <div
            className="prose prose-invert mt-5 max-w-none"
            dangerouslySetInnerHTML={{
              __html:
                tournament.description_html ||
                '<p>Este torneo todavía no tiene descripción.</p>',
            }}
          />
        </article>

        <aside className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-white">Inscripción</h2>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Estado del registro
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {getRegistrationStatusText(tournament)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Cierre de registro
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {formatDate(tournament.registration_closes_at)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Decklist
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {tournament.is_decklist_required ? 'Obligatorio' : 'Opcional'}
              </p>
            </div>

            {needsCode && !isRegistered ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Código de registro
                </label>

                <div className="relative">
                  <FiLock
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="text"
                    value={registrationCode}
                    onChange={(e) => setRegistrationCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none focus:border-cyan-400"
                    placeholder="Ingresá tu código"
                  />
                </div>
              </div>
            ) : null}

            {isRegistered ? (
              <div className="space-y-3">
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">
                  Ya estás registrado en este torneo como{' '}
                  <span className="font-semibold text-white">
                    {myRegistration?.display_name_snapshot}
                  </span>
                  .
                </div>

                {hasMyDecklist ? (
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-300">
                    Ya subiste tu decklist.
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleOpenDecklist}
                  className="w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
                >
                  {hasMyDecklist ? 'Editar decklist' : 'Subir decklist'}
                </button>

                <button
                  type="button"
                  onClick={handleUnregister}
                  disabled={unregistering}
                  className="w-full rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-70"
                >
                  {unregistering ? 'Cancelando...' : 'Cancelar inscripción'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRegister}
                disabled={
                  registering ||
                  checkingRegistration ||
                  !tournament.registration_available ||
                  (needsCode && !registrationCode.trim())
                }
                className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-70"
              >
                {checkingRegistration
                  ? 'Verificando...'
                  : registering
                    ? 'Registrando...'
                    : 'Registrarme'}
              </button>
            )}
          </div>
        </aside>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold text-white">Jugadores registrados</h2>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800">
          {tournament.registrations?.length > 0 ? (
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
                  {tournament.registrations.map((item) => (
                    <tr key={item.id} className="border-b border-slate-800 last:border-b-0">
                      <td className="px-4 py-3 text-white">
                        {item.display_name_snapshot}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {formatDate(item.created_at || item.createdAt)}
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