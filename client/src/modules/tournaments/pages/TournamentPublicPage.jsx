import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiCalendar,
  FiCheck,
  FiClipboard,
  FiLock,
  FiMapPin,
  FiSave,
  FiUsers,
  FiX,
  FiInfo,
} from 'react-icons/fi';
import { toast } from 'sonner';
import { useAuth } from '../../auth/context/AuthContext';
import {
  createTournamentDecklist,
  getMyTournamentDecklist,
  getMyTournamentRegistration,
  getPublicTournamentBySlug,
  getTournamentRegistrationsBySlug,
  registerToTournament,
  unregisterFromTournament,
  updateTournamentDecklist,
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

function detectDecklistInputFormat(value = '') {
  const raw = value.trim();

  if (!raw) return null;

  if (raw.startsWith('[') && raw.endsWith(']')) {
    try {
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        return 'tts';
      }
    } catch (error) {
      return 'text';
    }
  }

  return 'text';
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 min-h-[96px] h-full">
      <div className="flex h-full min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold leading-5 text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function QuickSwitchCard({
  icon: Icon,
  title,
  subtitle,
  badge,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${active
        ? 'border-cyan-300/70 bg-cyan-400/10 shadow-lg shadow-cyan-950/30'
        : 'border-cyan-400/20 bg-slate-950/70 hover:border-cyan-300/60 hover:bg-cyan-400/10'
        }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-white">{title}</p>
        <p className="truncate text-sm text-slate-400">{subtitle}</p>
      </div>

      {badge ? (
        <span className="shrink-0 rounded-full border border-cyan-400/30 bg-slate-950 px-3 py-1 text-xs font-bold text-cyan-300">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function SectionTab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${active
        ? 'bg-cyan-400 text-slate-950'
        : 'border border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-500 hover:text-white'
        }`}
    >
      {children}
    </button>
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
  const [registrations, setRegistrations] = useState([]);

  const [registrationCode, setRegistrationCode] = useState('');
  const [registering, setRegistering] = useState(false);
  const [unregistering, setUnregistering] = useState(false);
  const [savingDecklist, setSavingDecklist] = useState(false);

  const [myRegistration, setMyRegistration] = useState(null);
  const [myDecklist, setMyDecklist] = useState(null);
  const [checkingRegistration, setCheckingRegistration] = useState(false);

  const [activeSection, setActiveSection] = useState('info');
  const [rawInput, setRawInput] = useState('');

  const loadTournament = async () => {
    const data = await getPublicTournamentBySlug(slug);
    setTournament(data.tournament);
    return data.tournament;
  };

  const loadRegistrations = async () => {
    try {
      const data = await getTournamentRegistrationsBySlug(slug);
      setRegistrations(data.registrations || []);
      return data.registrations || [];
    } catch (error) {
      setRegistrations([]);
      return [];
    }
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

  const loadPageData = useCallback(
    async ({ showMainLoading = false } = {}) => {
      try {
        if (showMainLoading) {
          setLoading(true);
        }

        const tournamentData = await getPublicTournamentBySlug(slug);
        const loadedTournament = tournamentData.tournament;

        setTournament(loadedTournament);

        const registrationsPromise = getTournamentRegistrationsBySlug(slug)
          .then((data) => {
            setRegistrations(data.registrations || []);
          })
          .catch(() => {
            setRegistrations([]);
          });

        if (!token || !loadedTournament?.id) {
          setMyRegistration(null);
          setMyDecklist(null);
          await registrationsPromise;
          return loadedTournament;
        }

        setCheckingRegistration(true);

        let registration = null;

        try {
          const registrationData = await getMyTournamentRegistration(
            loadedTournament.id,
            token
          );

          registration = registrationData.registration || null;
          setMyRegistration(registration);
        } catch (error) {
          registration = null;
          setMyRegistration(null);
          setMyDecklist(null);
        }

        const userIsRegistered =
          registration?.registration_status === 'registered';

        if (userIsRegistered) {
          try {
            const decklistData = await getMyTournamentDecklist(
              loadedTournament.id,
              token
            );

            setMyDecklist(decklistData.decklist || null);
          } catch (error) {
            setMyDecklist(null);
          }
        } else {
          setMyDecklist(null);
        }

        await registrationsPromise;

        return loadedTournament;
      } catch (error) {
        console.error('Error loading public tournament:', error);
        toast.error(error.message || 'No se pudo cargar el torneo');
        setTournament(null);
        return null;
      } finally {
        setLoading(false);
        setCheckingRegistration(false);
      }
    },
    [slug, token]
  );

  useEffect(() => {
    if (!slug) return;

    loadPageData({ showMainLoading: true });
  }, [slug, token, loadPageData]);

  useEffect(() => {
    setRawInput('');
  }, [myDecklist?.id]);

  const needsCode = useMemo(() => {
    const code = tournament?.registrationMode?.code;
    return code === 'shared_code' || code === 'single_use_code';
  }, [tournament]);

  const isRegistered = myRegistration?.registration_status === 'registered';
  const hasMyDecklist = !!myDecklist;

  const detectedFormat = useMemo(() => {
    return detectDecklistInputFormat(rawInput);
  }, [rawInput]);

  const decklistClosed = useMemo(() => {
    if (!tournament) return false;

    if (!tournament.is_decklist_submit_open) return true;

    if (
      tournament.decklist_closes_at &&
      new Date(tournament.decklist_closes_at) < new Date()
    ) {
      return true;
    }

    return false;
  }, [tournament]);

  const deckCards = useMemo(() => {
    if (!myDecklist?.parsed_cards_json) return [];

    if (Array.isArray(myDecklist.parsed_cards_json)) {
      return myDecklist.parsed_cards_json;
    }

    return [];
  }, [myDecklist]);

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

      await loadPageData();
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
      setMyRegistration(null);
      setMyDecklist(null);
      await loadPageData();
      setActiveSection('info');
      toast.success('Tu inscripción fue cancelada');
    } catch (error) {
      console.error('Error unregistering from tournament:', error);
      toast.error(error.message || 'No se pudo cancelar la inscripción');
    } finally {
      setUnregistering(false);
    }
  };

  const handleSaveDecklist = async () => {
    if (!tournament?.id) return;

    try {
      setSavingDecklist(true);

      const payload = {
        raw_input: rawInput,
      };

      if (hasMyDecklist) {
        await updateTournamentDecklist(tournament.id, payload, token);
        toast.success('Decklist actualizado correctamente');
      } else {
        await createTournamentDecklist(tournament.id, payload, token);
        toast.success('Decklist cargado correctamente');
      }

      setRawInput('');
      await loadPageData();
    } catch (error) {
      console.error('Error saving decklist:', error);
      toast.error(error.message || 'No se pudo guardar el decklist');
    } finally {
      setSavingDecklist(false);
    }
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
      <section className="overflow-hidden rounded-[32px] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 sm:p-6 lg:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px] 2xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
              Torneo público
            </div>

            <h1 className="break-words text-3xl font-bold leading-tight text-white sm:text-4xl">
              {tournament.name}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Información del torneo, inscripción y detalles para los jugadores.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
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
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <QuickSwitchCard
              icon={FiInfo}
              title="Descripción"
              subtitle="Ver información general"
              active={activeSection === 'info'}
              onClick={() => setActiveSection('info')}
            />

            <QuickSwitchCard
              icon={FiUsers}
              title="Jugadores"
              subtitle="Listado"
              badge={
                tournament.player_limit_enabled && tournament.max_players
                  ? `${tournament.registrations_count}/${tournament.max_players}`
                  : `${tournament.registrations_count}`
              }
              active={activeSection === 'players'}
              onClick={() => setActiveSection('players')}
            />

            <QuickSwitchCard
              icon={FiClipboard}
              title="Mi Decklist"
              subtitle={hasMyDecklist ? 'Ya cargaste tu lista' : 'Cargar o editar'}
              badge={hasMyDecklist ? 'OK' : 'NO'}
              active={activeSection === 'decklist'}
              onClick={() => setActiveSection('decklist')}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          {activeSection === 'info' ? (
            <>
              <h2 className="text-xl font-semibold text-white">Descripción</h2>

              <div
                className="prose prose-invert mt-5 max-w-none"
                dangerouslySetInnerHTML={{
                  __html:
                    tournament.description_html ||
                    '<p>Este torneo todavía no tiene descripción.</p>',
                }}
              />
            </>
          ) : null}

          {activeSection === 'decklist' ? (
            <>
              <h2 className="text-xl font-semibold text-white">Mi decklist</h2>

              {!token ? (
                <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                  Iniciá sesión para cargar tu decklist.
                </div>
              ) : !isRegistered ? (
                <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                  Tenés que estar registrado en el torneo para cargar tu decklist.
                </div>
              ) : (
                <div className="mt-5 space-y-5">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Pegá tu decklist
                    </label>

                    <textarea
                      value={rawInput}
                      onChange={(e) => setRawInput(e.target.value)}
                      className="min-h-[280px] w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      placeholder={'// Digimon DeckList\n4 Yaamon EX11-005\n4 Guilmon BT24-066'}
                      disabled={decklistClosed || savingDecklist}
                    />

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={handleSaveDecklist}
                        disabled={
                          savingDecklist || decklistClosed || !rawInput.trim()
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-70"
                      >
                        <FiSave size={16} />
                        {savingDecklist
                          ? 'Guardando...'
                          : hasMyDecklist
                            ? 'Reemplazar decklist'
                            : 'Guardar decklist'}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold text-white">
                        Baraja cargada
                      </h3>

                      <span className="text-sm text-slate-400">
                        {hasMyDecklist
                          ? `Formato: ${myDecklist?.input_format?.toUpperCase() || 'N/A'
                          }`
                          : detectedFormat
                            ? `Detectado: ${detectedFormat.toUpperCase()}`
                            : 'Sin decklist cargado'}
                      </span>
                    </div>

                    {deckCards.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {deckCards.map((card, index) => (
                          <div
                            key={`${card.code}-${index}`}
                            className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
                          >
                            <div className="relative">
                              <img
                                src={card.image_url}
                                alt={card.name || card.code}
                                className="h-auto w-full object-cover"
                              />
                              <span className="absolute right-2 top-2 rounded-full bg-slate-950/90 px-2 py-1 text-xs font-bold text-white">
                                x{card.quantity}
                              </span>
                            </div>

                            <div className="p-3">
                              <p className="text-sm font-semibold text-white">
                                {card.name || card.code}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {card.code}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
                        Todavía no cargaste un decklist.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : null}

          {activeSection === 'players' ? (
            <>
              <h2 className="text-xl font-semibold text-white">
                Jugadores registrados
              </h2>

              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800">
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
                              {item.display_name_snapshot}
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              {formatDate(
                                item.registered_at ||
                                item.created_at ||
                                item.createdAt
                              )}
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
            </>
          ) : null}
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

                <button
                  type="button"
                  onClick={() => setActiveSection('decklist')}
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
    </div>
  );
}