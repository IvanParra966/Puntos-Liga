import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import {
  FiArrowLeft,
  FiCalendar,
  FiClipboard,
  FiGrid,
  FiLayers,
  FiSave,
  FiTrash2,
  FiUsers,
} from 'react-icons/fi';
import { toast } from 'sonner';
import { useAuth } from '../../auth/context/AuthContext';
import {
  getTournamentById,
  getTournamentCatalogs,
  updateTournament,
  deleteTournament,
} from '../services/tournamentsService';
import 'react-quill/dist/quill.snow.css';
import DeleteTournamentModal from '../components/DeleteTournamentModal';

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

function toDateTimeLocal(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function Checkbox({ label, checked, onChange, description }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-start justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-4 text-left transition hover:border-slate-700"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        ) : null}
      </div>

      <span
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-cyan-400' : 'bg-slate-700'
          }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? 'left-6' : 'left-1'
            }`}
        />
      </span>
    </button>
  );
}

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function inputClassName() {
  return 'w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400';
}

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          <Icon size={18} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          ) : null}
        </div>
      </div>

      {children}
    </section>
  );
}

function buildInitialForm(tournament) {
  return {
    name: tournament?.name || '',
    description_html: tournament?.description_html || '',
    event_mode: tournament?.event_mode || 'in_person',

    format_id: tournament?.format_id || '',
    point_structure_id: tournament?.point_structure_id || '',
    registration_mode_id: tournament?.registration_mode_id || '',
    pairing_system_id: tournament?.pairing_system_id || '',
    match_mode_id: tournament?.match_mode_id || '',

    lifecycle_status: tournament?.lifecycle_status || 'draft',

    is_registration_open: !!tournament?.is_registration_open,
    is_decklist_submit_open: !!tournament?.is_decklist_submit_open,

    registration_opens_at: toDateTimeLocal(tournament?.registration_opens_at),
    registration_closes_at: toDateTimeLocal(tournament?.registration_closes_at),
    decklist_closes_at: toDateTimeLocal(tournament?.decklist_closes_at),
    starts_at: toDateTimeLocal(tournament?.starts_at),

    is_decklist_required: !!tournament?.is_decklist_required,
    can_view_decklists: !!tournament?.can_view_decklists,
    show_deck_name: !!tournament?.show_deck_name,
    show_decklists_after_tournament:
      !!tournament?.show_decklists_after_tournament,
    allow_sideboard: !!tournament?.allow_sideboard,

    remove_dropped_players: !!tournament?.remove_dropped_players,

    player_limit_enabled: !!tournament?.player_limit_enabled,
    max_players: tournament?.max_players || '',

    round_limits_enabled: !!tournament?.round_limits_enabled,

    registration_code: tournament?.registration_code || '',

    round_rules:
      tournament?.roundRules?.length > 0
        ? tournament.roundRules
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((rule, index) => ({
            min_players: rule.min_players || '',
            max_players: rule.max_players || '',
            rounds_count: rule.rounds_count || '',
            sort_order: rule.sort_order || index + 1,
          }))
        : [{ min_players: '', max_players: '', rounds_count: '', sort_order: 1 }],
  };
}

function getStatusLabel(status) {
  switch (status) {
    case 'draft':
      return 'Borrador';
    case 'published':
      return 'Publicado';
    case 'running':
      return 'En curso';
    case 'finished':
      return 'Finalizado';
    default:
      return status || 'Sin estado';
  }
}

function getStatusClassName(status) {
  switch (status) {
    case 'draft':
      return 'border-slate-700 bg-slate-800/80 text-slate-200';
    case 'published':
      return 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300';
    case 'running':
      return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300';
    case 'finished':
      return 'border-violet-400/30 bg-violet-400/10 text-violet-300';
    default:
      return 'border-slate-700 bg-slate-800/80 text-slate-200';
  }
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  );
}



export default function TournamentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tournament, setTournament] = useState(null);
  const [catalogs, setCatalogs] = useState(null);
  const [form, setForm] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteTournament = async () => {
    const tournamentId = tournament?.id || id;

    if (!tournamentId) {
      toast.error('No se encontró el torneo');
      return;
    }

    try {
      setDeleting(true);

      await deleteTournament(
        tournamentId,
        { current_password: deletePassword },
        token
      );

      toast.success('Torneo eliminado correctamente');
      setDeleteModalOpen(false);
      setDeletePassword('');
      navigate('/organization');
    } catch (error) {
      console.error('Error deleting tournament:', error);
      toast.error(error.message || 'No se pudo eliminar el torneo');
    } finally {
      setDeleting(false);
    }
  };

  const registrationModeLabel = useMemo(() => {
    const selectedMode = catalogs?.registration_modes?.find(
      (item) => Number(item.id) === Number(form?.registration_mode_id)
    );
    return selectedMode?.name || 'Sin modo';
  }, [catalogs, form?.registration_mode_id]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);

        const [tournamentData, catalogsData] = await Promise.all([
          getTournamentById(id, token),
          getTournamentCatalogs(token),
        ]);

        setTournament(tournamentData.tournament);
        setCatalogs(catalogsData);
        setForm(buildInitialForm(tournamentData.tournament));
      } catch (error) {
        console.error('Error loading tournament detail:', error);
        toast.error(error.message || 'No se pudo cargar el torneo');
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      run();
    }
  }, [token, id]);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateRoundRule = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      round_rules: prev.round_rules.map((rule, i) =>
        i === index ? { ...rule, [field]: value } : rule
      ),
    }));
  };

  const addRoundRule = () => {
    setForm((prev) => ({
      ...prev,
      round_rules: [
        ...prev.round_rules,
        {
          min_players: '',
          max_players: '',
          rounds_count: '',
          sort_order: prev.round_rules.length + 1,
        },
      ],
    }));
  };

  const removeRoundRule = (index) => {
    setForm((prev) => ({
      ...prev,
      round_rules: prev.round_rules
        .filter((_, i) => i !== index)
        .map((item, i) => ({
          ...item,
          sort_order: i + 1,
        })),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await updateTournament(
        id,
        {
          ...form,
          format_id: Number(form.format_id),
          point_structure_id: Number(form.point_structure_id),
          registration_mode_id: Number(form.registration_mode_id),
          pairing_system_id: Number(form.pairing_system_id),
          match_mode_id: Number(form.match_mode_id),
        },
        token
      );

      toast.success('Torneo actualizado correctamente');

      const refreshed = await getTournamentById(id, token);
      setTournament(refreshed.tournament);
      setForm(buildInitialForm(refreshed.tournament));
    } catch (error) {
      console.error('Error saving tournament:', error);
      toast.error(error.message || 'No se pudo guardar el torneo');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
        Cargando torneo...
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-2xl font-bold text-white">Torneo</h1>
        <p className="mt-3 text-sm text-slate-400">
          No se encontró el torneo.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[32px] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
          <div className="border-b border-slate-800/80 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/organization')}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-400 hover:text-white"
                  >
                    <FiArrowLeft size={15} />
                    Volver a organización
                  </button>

                  <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
                    Gestión del torneo
                  </span>
                </div>

                <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {form.name || tournament.name}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Administrá la configuración, fechas, reglas y comportamiento general
                  del torneo desde un solo lugar.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <SummaryItem
                    label="Formato"
                    value={tournament.format?.name || 'Sin formato'}
                  />
                  <SummaryItem
                    label="Modo de match"
                    value={tournament.matchMode?.name || 'Sin match mode'}
                  />
                  <SummaryItem
                    label="Emparejamiento"
                    value={tournament.pairingSystem?.name || 'Sin sistema'}
                  />
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Estado
                    </p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClassName(
                          form.lifecycle_status
                        )}`}
                      >
                        {getStatusLabel(form.lifecycle_status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full xl:max-w-sm">
                <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Modalidad
                      </p>
                      <p className="mt-1 text-sm font-medium text-white">
                        {form.event_mode === 'online' ? 'Online' : 'Presencial'}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Registro
                      </p>
                      <p className="mt-1 text-sm font-medium text-white">
                        {form.is_registration_open ? 'Abierto' : 'Cerrado'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row xl:flex-col">
                    <button
                      type="button"
                      onClick={() => setDeleteModalOpen(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20"
                    >
                      <FiTrash2 size={16} />
                      Eliminar torneo
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || !form.name.trim()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-70"
                    >
                      <FiSave size={16} />
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/tournaments/${tournament.slug}`)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-white"
                    >
                      Ver página pública
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6">
          <SectionCard
            icon={FiGrid}
            title="Información general"
            description="Datos principales y descripción pública."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nombre del torneo">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={inputClassName()}
                />
              </Field>

              <Field label="Modalidad">
                <select
                  value={form.event_mode}
                  onChange={(e) => updateField('event_mode', e.target.value)}
                  className={inputClassName()}
                >
                  {(catalogs?.event_modes || []).map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Formato">
                <select
                  value={form.format_id}
                  onChange={(e) => updateField('format_id', e.target.value)}
                  className={inputClassName()}
                >
                  {(catalogs?.formats || []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Estado del torneo">
                <select
                  value={form.lifecycle_status}
                  onChange={(e) => updateField('lifecycle_status', e.target.value)}
                  className={inputClassName()}
                >
                  <option value="draft">Borrador</option>
                  <option value="running">En curso</option>
                  <option value="finished">Finalizado</option>
                </select>
              </Field>

              <div className="md:col-span-2">
                <Field label="Descripción">
                  <div className="overflow-hidden rounded-2xl border border-slate-800 bg-white text-black">
                    <ReactQuill
                      theme="snow"
                      value={form.description_html}
                      onChange={(value) => updateField('description_html', value)}
                      modules={quillModules}
                    />
                  </div>
                </Field>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={FiCalendar}
            title="Fechas y estado"
            description="Registro, decklist e inicio del torneo."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Checkbox
                label="Registro abierto"
                description="Permite que los jugadores se anoten."
                checked={form.is_registration_open}
                onChange={(value) => updateField('is_registration_open', value)}
              />

              <Checkbox
                label="Decklist submit abierto"
                description="Permite que los jugadores carguen su deck."
                checked={form.is_decklist_submit_open}
                onChange={(value) =>
                  updateField('is_decklist_submit_open', value)
                }
              />

              <Field label="Apertura de registro">
                <input
                  type="datetime-local"
                  value={form.registration_opens_at}
                  onChange={(e) =>
                    updateField('registration_opens_at', e.target.value)
                  }
                  className={inputClassName()}
                />
              </Field>

              <Field label="Cierre de registro">
                <input
                  type="datetime-local"
                  value={form.registration_closes_at}
                  onChange={(e) =>
                    updateField('registration_closes_at', e.target.value)
                  }
                  className={inputClassName()}
                />
              </Field>

              <Field label="Cierre de decklist">
                <input
                  type="datetime-local"
                  value={form.decklist_closes_at}
                  onChange={(e) =>
                    updateField('decklist_closes_at', e.target.value)
                  }
                  className={inputClassName()}
                />
              </Field>

              <Field label="Inicio del torneo">
                <input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) => updateField('starts_at', e.target.value)}
                  className={inputClassName()}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            icon={FiClipboard}
            title="Decklist"
            description="Comportamiento y visibilidad de los mazos."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Checkbox
                label="Decklist obligatorio"
                checked={form.is_decklist_required}
                onChange={(value) => updateField('is_decklist_required', value)}
              />

              <Checkbox
                label="Se puede ver el decklist"
                checked={form.can_view_decklists}
                onChange={(value) => updateField('can_view_decklists', value)}
              />

              <Checkbox
                label="Mostrar nombre del deck"
                checked={form.show_deck_name}
                onChange={(value) => updateField('show_deck_name', value)}
              />

              <Checkbox
                label="Mostrar decklists después del torneo"
                checked={form.show_decklists_after_tournament}
                onChange={(value) =>
                  updateField('show_decklists_after_tournament', value)
                }
              />

              <Checkbox
                label="Permitir side deck"
                checked={form.allow_sideboard}
                onChange={(value) => updateField('allow_sideboard', value)}
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={FiUsers}
            title="Registro"
            description="Modo de inscripción y límite de jugadores."
          >
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <Field label="Modo de registro">
                    <select
                      value={form.registration_mode_id}
                      onChange={(e) =>
                        updateField('registration_mode_id', e.target.value)
                      }
                      className={inputClassName()}
                    >
                      {(catalogs?.registration_modes || []).map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  {(catalogs?.registration_modes || []).find(
                    (item) => Number(item.id) === Number(form.registration_mode_id)
                  )?.code !== 'open' ? (
                    <div className="mt-4">
                      <Field label="Código de registro">
                        <input
                          type="text"
                          value={form.registration_code}
                          onChange={(e) =>
                            updateField('registration_code', e.target.value)
                          }
                          className={inputClassName()}
                          placeholder="Código del torneo"
                        />
                      </Field>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-4">
                  <Checkbox
                    label="Limitar jugadores"
                    description="Activa un cupo máximo de participantes."
                    checked={form.player_limit_enabled}
                    onChange={(value) => updateField('player_limit_enabled', value)}
                  />

                  {form.player_limit_enabled ? (
                    <Field
                      label="Máximo de jugadores"
                      hint="Definí el cupo máximo permitido en este torneo."
                    >
                      <input
                        type="number"
                        min="1"
                        value={form.max_players}
                        onChange={(e) => updateField('max_players', e.target.value)}
                        className={inputClassName()}
                        placeholder="Ej: 32"
                      />
                    </Field>
                  ) : null}
                </div>
              </div>

              <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                  Resumen de registro
                </p>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Modo
                    </p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {registrationModeLabel}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Cupo
                    </p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {form.player_limit_enabled
                        ? form.max_players
                          ? `${form.max_players} jugadores`
                          : 'Definí el máximo'
                        : 'Sin límite'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={FiLayers}
            title="Emparejamiento y rondas"
            description="Sistema competitivo y reglas automáticas de rondas."
          >
            <div className="grid gap-6">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Estructura de puntos">
                      <select
                        value={form.point_structure_id}
                        onChange={(e) =>
                          updateField('point_structure_id', e.target.value)
                        }
                        className={inputClassName()}
                      >
                        {(catalogs?.point_structures || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Sistema de emparejamiento">
                      <select
                        value={form.pairing_system_id}
                        onChange={(e) =>
                          updateField('pairing_system_id', e.target.value)
                        }
                        className={inputClassName()}
                      >
                        {(catalogs?.pairing_systems || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label="Modo de match"
                      hint="Bo5 significa que gana quien gana 3 partidas."
                    >
                      <select
                        value={form.match_mode_id}
                        onChange={(e) =>
                          updateField('match_mode_id', e.target.value)
                        }
                        className={inputClassName()}
                      >
                        {(catalogs?.match_modes || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <Checkbox
                      label="Remover jugadores drop"
                      description="Los jugadores removidos dejan de contar para la estructura del torneo."
                      checked={form.remove_dropped_players}
                      onChange={(value) =>
                        updateField('remove_dropped_players', value)
                      }
                    />
                  </div>
                </div>

                <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                    Rondas automáticas
                  </p>

                  <div className="mt-4">
                    <Checkbox
                      label="Activar límites de jugadores por ronda"
                      description="Usá reglas automáticas según la cantidad de jugadores."
                      checked={form.round_limits_enabled}
                      onChange={(value) =>
                        updateField('round_limits_enabled', value)
                      }
                    />
                  </div>
                </div>
              </div>

              {form.round_limits_enabled ? (
                <div className="space-y-3">
                  {form.round_rules.map((rule, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 md:grid-cols-4"
                    >
                      <Field label="Min jugadores">
                        <input
                          type="number"
                          min="1"
                          value={rule.min_players}
                          onChange={(e) =>
                            updateRoundRule(index, 'min_players', e.target.value)
                          }
                          className={inputClassName()}
                        />
                      </Field>

                      <Field label="Max jugadores">
                        <input
                          type="number"
                          min="1"
                          value={rule.max_players}
                          onChange={(e) =>
                            updateRoundRule(index, 'max_players', e.target.value)
                          }
                          className={inputClassName()}
                        />
                      </Field>

                      <Field label="Cantidad de rondas">
                        <input
                          type="number"
                          min="1"
                          value={rule.rounds_count}
                          onChange={(e) =>
                            updateRoundRule(index, 'rounds_count', e.target.value)
                          }
                          className={inputClassName()}
                        />
                      </Field>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeRoundRule(index)}
                          className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addRoundRule}
                    className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400 hover:text-white"
                  >
                    Agregar regla de rondas
                  </button>
                </div>
              ) : null}
            </div>
          </SectionCard>
        </div>
      </div>
      <DeleteTournamentModal
        open={deleteModalOpen}
        password={deletePassword}
        loading={deleting}
        tournamentName={form?.name || tournament?.name}
        onPasswordChange={setDeletePassword}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletePassword('');
        }}
        onConfirm={handleDeleteTournament}
      />
    </>
  );
}