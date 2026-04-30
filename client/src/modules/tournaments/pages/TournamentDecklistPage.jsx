import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiClipboard, FiSave } from 'react-icons/fi';
import { toast } from 'sonner';
import { useAuth } from '../../auth/context/AuthContext';
import {
  createTournamentDecklist,
  getMyTournamentDecklist,
  getMyTournamentRegistration,
  getPublicTournamentBySlug,
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

export default function TournamentDecklistPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token, loading: authLoading, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [tournament, setTournament] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [existingDecklist, setExistingDecklist] = useState(null);

  const [rawInput, setRawInput] = useState('');

  const loadPage = async () => {
    const tournamentData = await getPublicTournamentBySlug(slug);
    const tournamentLoaded = tournamentData.tournament;
    setTournament(tournamentLoaded);

    const [registrationData, decklistData] = await Promise.all([
      getMyTournamentRegistration(tournamentLoaded.id, token),
      getMyTournamentDecklist(tournamentLoaded.id, token),
    ]);

    setRegistration(registrationData.registration || null);
    setExistingDecklist(decklistData.decklist || null);

    // Importante: no rellenar el textarea con lo ya cargado
    setRawInput('');
  };

  useEffect(() => {
    const run = async () => {
      if (!token || !slug) return;

      try {
        setLoading(true);
        await loadPage();
      } catch (error) {
        console.error('Error loading decklist page:', error);
        toast.error(error.message || 'No se pudo cargar la página de decklist');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [slug, token]);

  const isRegistered = registration?.registration_status === 'registered';

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

  const cards = useMemo(() => {
    if (!existingDecklist?.parsed_cards_json) return [];

    if (Array.isArray(existingDecklist.parsed_cards_json)) {
      return existingDecklist.parsed_cards_json;
    }

    return [];
  }, [existingDecklist]);

  const handleSave = async () => {
    if (!tournament?.id) return;

    try {
      setSaving(true);

      const payload = {
        raw_input: rawInput,
      };

      if (existingDecklist) {
        await updateTournamentDecklist(tournament.id, payload, token);
        toast.success('Decklist actualizado correctamente');
      } else {
        await createTournamentDecklist(tournament.id, payload, token);
        toast.success('Decklist cargado correctamente');
      }

      setRawInput('');
      await loadPage();
    } catch (error) {
      console.error('Error saving decklist:', error);
      toast.error(error.message || 'No se pudo guardar el decklist');
    } finally {
      setSaving(false);
    }
  };

  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading || authLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
        Cargando decklist...
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
        No se encontró el torneo.
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <button
          type="button"
          onClick={() => navigate(`/tournaments/${slug}`)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
        >
          <FiArrowLeft size={16} />
          Volver al torneo
        </button>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-2xl font-bold text-white">Decklist</h1>
          <p className="mt-3 text-sm text-slate-400">
            Tenés que estar registrado en el torneo para cargar tu decklist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate(`/tournaments/${slug}`)}
              className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              <FiArrowLeft size={16} />
              Volver al torneo
            </button>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
              <FiClipboard size={14} />
              Mi decklist
            </div>

            <h1 className="text-3xl font-bold text-white">{tournament.name}</h1>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm">
            <p className="text-slate-500">Cierre de decklist</p>
            <p className="mt-1 font-medium text-white">
              {formatDate(tournament.decklist_closes_at)}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Pegá tu decklist
          </label>

          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            className="min-h-[320px] w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
            placeholder={'// Digimon DeckList\n4 Yaamon EX11-005\n4 Guilmon BT24-066'}
            disabled={decklistClosed || saving}
          />

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || decklistClosed || !rawInput.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-70"
            >
              <FiSave size={16} />
              {saving
                ? 'Guardando...'
                : existingDecklist
                  ? 'Reemplazar decklist'
                  : 'Guardar decklist'}
            </button>
          </div>
        </article>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-white">Estado</h2>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Registro
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {isRegistered ? 'Registrado' : 'No registrado'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Decklist
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {existingDecklist ? 'Cargado' : 'Todavía no cargado'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Carga habilitada
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {decklistClosed ? 'No' : 'Sí'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Formato detectado
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {detectedFormat ? detectedFormat.toUpperCase() : 'Sin detectar'}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold text-white">Baraja cargada</h2>

        <div className="mt-5">
          {cards.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {cards.map((card, index) => (
                <div
                  key={`${card.code}-${index}`}
                  className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"
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
                    <p className="mt-1 text-xs text-slate-400">{card.code}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
              Todavía no cargaste un decklist.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}