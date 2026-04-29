import { useEffect, useMemo, useState } from 'react';
import ReactQuill from 'react-quill';
import {
  FiCalendar,
  FiCheckSquare,
  FiClipboard,
  FiGrid,
  FiLayers,
  FiSettings,
  FiUsers,
} from 'react-icons/fi';
import 'react-quill/dist/quill.snow.css';

const defaultForm = {
  name: '',
  description_html: '',
  event_mode: 'in_person',

  format_id: '',
  point_structure_id: '',
  registration_mode_id: '',
  pairing_system_id: '',
  match_mode_id: '',

  is_registration_open: false,
  is_decklist_submit_open: false,

  registration_opens_at: '',
  registration_closes_at: '',
  decklist_closes_at: '',
  starts_at: '',

  is_decklist_required: true,
  can_view_decklists: false,
  show_deck_name: false,
  show_decklists_after_tournament: false,
  allow_sideboard: true,

  remove_dropped_players: false,

  player_limit_enabled: true,
  max_players: '',

  round_limits_enabled: false,

  registration_code: '',

  round_rules: [
    { min_players: '', max_players: '', rounds_count: '', sort_order: 1 },
  ],

  staff: [],
};

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

const sections = [
  { id: 'general', label: 'General', icon: FiGrid },
  { id: 'timing', label: 'Fechas y estado', icon: FiCalendar },
  { id: 'decklist', label: 'Decklist', icon: FiClipboard },
  { id: 'registration', label: 'Registro', icon: FiUsers },
  { id: 'rounds', label: 'Emparejamiento', icon: FiLayers },
];

function getNowLocalDateTime() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function Checkbox({ label, checked, onChange, description }) {
  return (
    <label className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-200">{label}</p>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {description}
            </p>
          ) : null}
        </div>

        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 accent-cyan-400"
        />
      </div>
    </label>
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

function SectionCard({ title, description, children }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950 p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        ) : null}
      </div>

      {children}
    </section>
  );
}

function SectionNav({ activeSection, onChange }) {
  return (
    <>
      <aside className="hidden w-full max-w-[240px] shrink-0 lg:block">
        <div className="sticky top-0 rounded-3xl border border-slate-800 bg-slate-950 p-3">
          <div className="mb-3 flex items-center gap-2 px-2 py-2 text-sm font-semibold text-white">
            <FiSettings size={16} />
            Configuración
          </div>

          <div className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => onChange(section.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${isActive
                    ? 'bg-cyan-400/10 text-cyan-300'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                >
                  <Icon size={16} />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onChange(section.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${isActive
                  ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300'
                  : 'border-slate-700 bg-slate-950 text-slate-300'
                  }`}
              >
                <Icon size={15} />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function ToggleRow({ label, checked, onChange, description }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        ) : null}
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-cyan-400"
      />
    </div>
  );
}

function formatDateTimePreview(value) {
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
export default function CreateTournamentModal({
  open,
  onClose,
  onSubmit,
  loading,
  selectedNode,
  catalogs,
}) {
  const [form, setForm] = useState(defaultForm);
  const [activeSection, setActiveSection] = useState('general');

  useEffect(() => {
    if (!open) return;

    const defaultMatchMode =
      catalogs?.match_modes?.find((item) => item.code === 'bo3') ||
      catalogs?.match_modes?.[0];

    setActiveSection('general');
    setForm({
      ...defaultForm,
      registration_opens_at: getNowLocalDateTime(),
      format_id: catalogs?.formats?.[0]?.id || '',
      point_structure_id: catalogs?.point_structures?.[0]?.id || '',
      registration_mode_id: catalogs?.registration_modes?.[0]?.id || '',
      pairing_system_id: catalogs?.pairing_systems?.[0]?.id || '',
      match_mode_id: defaultMatchMode?.id || '',
    });
  }, [open, catalogs]);

  const canShowRegistrationCode = useMemo(() => {
    const selectedMode = catalogs?.registration_modes?.find(
      (item) => Number(item.id) === Number(form.registration_mode_id)
    );

    return (
      selectedMode?.code === 'shared_code' ||
      selectedMode?.code === 'single_use_code'
    );
  }, [catalogs, form.registration_mode_id]);

  const registrationModeLabel = useMemo(() => {
    const selectedMode = catalogs?.registration_modes?.find(
      (item) => Number(item.id) === Number(form.registration_mode_id)
    );
    return selectedMode?.name || 'Sin modo';
  }, [catalogs, form.registration_mode_id]);

  const matchModeLabel = useMemo(() => {
    const selectedMode = catalogs?.match_modes?.find(
      (item) => Number(item.id) === Number(form.match_mode_id)
    );
    return selectedMode?.name || 'Sin modo';
  }, [catalogs, form.match_mode_id]);

  if (!open) return null;

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    await onSubmit({
      ...form,
      format_id: Number(form.format_id),
      point_structure_id: Number(form.point_structure_id),
      registration_mode_id: Number(form.registration_mode_id),
      pairing_system_id: Number(form.pairing_system_id),
      match_mode_id: Number(form.match_mode_id),
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[90] bg-slate-950/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[100] overflow-y-auto p-3 sm:p-4">
        <div className="mx-auto w-full max-w-7xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <div className="mb-5 flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
                  Nuevo torneo
                </div>

                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Crear torneo
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Se va a crear dentro de{' '}
                  <span className="font-semibold text-white">
                    {selectedNode?.name || 'Sin carpeta'}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-5 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6 lg:space-y-0">
              <SectionNav
                activeSection={activeSection}
                onChange={setActiveSection}
              />

              <div className="min-w-0 space-y-5">
                {activeSection === 'general' ? (
                  <>
                    <SectionCard
                      title="Información general"
                      description="Definí los datos principales del torneo."
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <Field label="Nombre del torneo">
                            <input
                              type="text"
                              value={form.name}
                              onChange={(e) =>
                                updateField('name', e.target.value)
                              }
                              className={inputClassName()}
                              placeholder="Ej: Liga Catamarca - Fecha 1"
                            />
                          </Field>
                        </div>

                        <Field label="Modalidad">
                          <select
                            value={form.event_mode}
                            onChange={(e) =>
                              updateField('event_mode', e.target.value)
                            }
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
                            onChange={(e) =>
                              updateField('format_id', e.target.value)
                            }
                            className={inputClassName()}
                          >
                            {(catalogs?.formats || []).map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>
                    </SectionCard>

                    <SectionCard
                      title="Descripción"
                      description="Este texto se va a mostrar en la página pública del torneo."
                    >
                      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-white text-black">
                        <ReactQuill
                          theme="snow"
                          value={form.description_html}
                          onChange={(value) =>
                            updateField('description_html', value)
                          }
                          modules={quillModules}
                        />
                      </div>
                    </SectionCard>
                  </>
                ) : null}

                {activeSection === 'timing' ? (
                  <SectionCard
                    title="Fechas y estado"
                    description="Controlá cuándo abre y cierra cada etapa del torneo."
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <Checkbox
                        label="Registro abierto"
                        description="Permite que los jugadores puedan anotarse."
                        checked={form.is_registration_open}
                        onChange={(value) =>
                          updateField('is_registration_open', value)
                        }
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
                            updateField(
                              'registration_closes_at',
                              e.target.value
                            )
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
                          onChange={(e) =>
                            updateField('starts_at', e.target.value)
                          }
                          className={inputClassName()}
                        />
                      </Field>
                    </div>
                  </SectionCard>
                ) : null}

                {activeSection === 'decklist' ? (
                  <SectionCard
                    title="Configuración de decklist"
                    description="Definí cómo se comporta la carga y visibilidad de mazos."
                  >
                    <div className="grid gap-3 md:grid-cols-2">
                      <Checkbox
                        label="Decklist obligatorio"
                        description="El jugador no puede completar su participación sin decklist."
                        checked={form.is_decklist_required}
                        onChange={(value) =>
                          updateField('is_decklist_required', value)
                        }
                      />

                      <Checkbox
                        label="Se puede ver el decklist"
                        description="Permite mostrar las listas a otros usuarios."
                        checked={form.can_view_decklists}
                        onChange={(value) =>
                          updateField('can_view_decklists', value)
                        }
                      />

                      <Checkbox
                        label="Mostrar nombre del deck"
                        description="Controla si el nombre del deck aparece públicamente."
                        checked={form.show_deck_name}
                        onChange={(value) =>
                          updateField('show_deck_name', value)
                        }
                      />

                      <Checkbox
                        label="Mostrar decklists después del torneo"
                        description="Ideal si querés mantenerlas ocultas durante el evento."
                        checked={form.show_decklists_after_tournament}
                        onChange={(value) =>
                          updateField(
                            'show_decklists_after_tournament',
                            value
                          )
                        }
                      />

                      <Checkbox
                        label="Permitir side deck"
                        description="Habilita el campo adicional de side deck en la carga."
                        checked={form.allow_sideboard}
                        onChange={(value) =>
                          updateField('allow_sideboard', value)
                        }
                      />
                    </div>
                  </SectionCard>
                ) : null}

                {activeSection === 'registration' ? (
                  <SectionCard
                    title="Registro de jugadores"
                    description="Elegí cómo se van a registrar los participantes."
                  >
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
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

                          {canShowRegistrationCode ? (
                            <div className="mt-4">
                              <Field
                                label="Código de registro"
                                hint="Usalo cuando el acceso al torneo no sea libre."
                              >
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

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-4">
                          <ToggleRow
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

                          <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              Apertura
                            </p>
                            <p className="mt-1 text-sm font-medium text-white">
                              {formatDateTimePreview(form.registration_opens_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                ) : null}

                {activeSection === 'rounds' ? (
                  <>
                    <SectionCard
                      title="Emparejamiento y puntos"
                      description="Definí el sistema competitivo del torneo."
                    >
                      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Estructura de puntos">
                            <select
                              value={form.point_structure_id}
                              onChange={(e) =>
                                updateField(
                                  'point_structure_id',
                                  e.target.value
                                )
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
                                updateField(
                                  'pairing_system_id',
                                  e.target.value
                                )
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

                          <Checkbox
                            label="Remover jugadores drop"
                            description="Los jugadores removidos no siguen contando en la estructura."
                            checked={form.remove_dropped_players}
                            onChange={(value) =>
                              updateField('remove_dropped_players', value)
                            }
                          />
                        </div>

                        <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/5 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                            Resumen competitivo
                          </p>

                          <div className="mt-4 space-y-3">
                            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                              <p className="text-xs uppercase tracking-wide text-slate-500">
                                Match
                              </p>
                              <p className="mt-1 text-sm font-medium text-white">
                                {matchModeLabel}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                              <p className="text-xs uppercase tracking-wide text-slate-500">
                                Rondas automáticas
                              </p>
                              <p className="mt-1 text-sm font-medium text-white">
                                {form.round_limits_enabled ? 'Activadas' : 'Desactivadas'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SectionCard>

                    <SectionCard
                      title="Rondas por cantidad de jugadores"
                      description="Podés definir automáticamente cuántas rondas usar según el rango de jugadores."
                    >
                      <div className="grid gap-3 md:grid-cols-2">
                        <Checkbox
                          label="Activar límites de jugadores por ronda"
                          description="Usá reglas automáticas según la cantidad de jugadores."
                          checked={form.round_limits_enabled}
                          onChange={(value) =>
                            updateField('round_limits_enabled', value)
                          }
                        />
                      </div>

                      {form.round_limits_enabled ? (
                        <div className="mt-4 space-y-3">
                          {form.round_rules.map((rule, index) => (
                            <div
                              key={index}
                              className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-4"
                            >
                              <Field label="Min jugadores">
                                <input
                                  type="number"
                                  min="1"
                                  value={rule.min_players}
                                  onChange={(e) =>
                                    updateRoundRule(
                                      index,
                                      'min_players',
                                      e.target.value
                                    )
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
                                    updateRoundRule(
                                      index,
                                      'max_players',
                                      e.target.value
                                    )
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
                                    updateRoundRule(
                                      index,
                                      'rounds_count',
                                      e.target.value
                                    )
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
                    </SectionCard>
                  </>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading || !form.name.trim()}
                className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-70"
              >
                {loading ? 'Creando...' : 'Crear torneo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}