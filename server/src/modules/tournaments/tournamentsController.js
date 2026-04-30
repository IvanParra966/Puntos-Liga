import {
  OrganizationMembers,
  OrganizationMembersPermissions,
  OrganizationNodes,
  OrganizationRolePermissions,
  OrganizationRoles,
  Permission,
  TournamentAccessCodes,
  TournamentFormats,
  TournamentMatchModes,
  TournamentPairingSystems,
  TournamentPointStructures,
  TournamentRegistrationModes,
  TournamentRoundRules,
  TournamentStaff,
  Tournaments,
  TournamentRegistrations,
  User,
  TournamentDecklists,
} from '../../database/models/index.js';
import bcrypt from 'bcryptjs';

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toBool(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 1 || value === '1') return true;
  if (value === 0 || value === '0') return false;
  return fallback;
}

async function getMembership(userId, organizationId) {
  return OrganizationMembers.findOne({
    where: {
      user_id: userId,
      organization_id: organizationId,
    },
    include: [
      {
        model: OrganizationRoles,
        as: 'organizationRole',
      },
    ],
  });
}

async function getEffectiveOrganizationPermissionCodes(member) {
  const rolePermissions = await OrganizationRolePermissions.findAll({
    where: {
      organization_role_id: member.organization_role_id,
    },
    include: [
      {
        model: Permission,
        as: 'permission',
        attributes: ['code'],
      },
    ],
  });

  const memberPermissions = await OrganizationMembersPermissions.findAll({
    where: {
      organization_member_id: member.id,
    },
    include: [
      {
        model: Permission,
        as: 'permission',
        attributes: ['code'],
      },
    ],
  });

  const codes = new Set();

  for (const item of rolePermissions) {
    if (item.permission?.code) {
      codes.add(item.permission.code);
    }
  }

  for (const item of memberPermissions) {
    if (!item.permission?.code) continue;

    if (item.allowed) {
      codes.add(item.permission.code);
    } else {
      codes.delete(item.permission.code);
    }
  }

  return codes;
}

function canCreateTournaments(member, permissionCodes) {
  return (
    member.organizationRole?.code === 'owner' ||
    permissionCodes.has('tournaments.create') ||
    permissionCodes.has('tournaments.update')
  );
}

function canManageTournament(member, permissionCodes) {
  return (
    member.organizationRole?.code === 'owner' ||
    permissionCodes.has('tournaments.update')
  );
}

async function ensureUniqueTournamentSlug(baseSlug) {
  let finalSlug = baseSlug;
  let counter = 1;

  while (await Tournaments.findOne({ where: { slug: finalSlug } })) {
    counter += 1;
    finalSlug = `${baseSlug}-${counter}`;
  }

  return finalSlug;
}

function normalizeRoundRules(roundRules = []) {
  if (!Array.isArray(roundRules)) return [];

  return roundRules
    .map((item, index) => ({
      min_players: Number(item.min_players),
      max_players: Number(item.max_players),
      rounds_count: Number(item.rounds_count),
      sort_order: Number(item.sort_order || index + 1),
    }))
    .filter(
      (item) =>
        Number.isFinite(item.min_players) &&
        Number.isFinite(item.max_players) &&
        Number.isFinite(item.rounds_count)
    );
}

function normalizeStaff(staff = []) {
  if (!Array.isArray(staff)) return [];

  return staff
    .map((item) => ({
      organization_member_id: Number(item.organization_member_id),
      role_label: item.role_label?.trim() || null,
      can_manage_registrations: toBool(item.can_manage_registrations),
      can_manage_decklists: toBool(item.can_manage_decklists),
      can_manage_pairings: toBool(item.can_manage_pairings),
      can_submit_results: toBool(item.can_submit_results),
      can_edit_tournament: toBool(item.can_edit_tournament),
    }))
    .filter((item) => Number.isFinite(item.organization_member_id));
}

function isTournamentRegistrationAvailable(tournament) {
  const now = new Date();

  if (!tournament.is_registration_open) {
    return {
      allowed: false,
      message: 'El registro del torneo está cerrado',
    };
  }

  if (
    tournament.registration_opens_at &&
    new Date(tournament.registration_opens_at) > now
  ) {
    return {
      allowed: false,
      message: 'El registro todavía no abrió',
    };
  }

  if (
    tournament.registration_closes_at &&
    new Date(tournament.registration_closes_at) < now
  ) {
    return {
      allowed: false,
      message: 'El registro del torneo ya cerró',
    };
  }

  if (tournament.lifecycle_status === 'finished') {
    return {
      allowed: false,
      message: 'El torneo ya finalizó',
    };
  }

  return {
    allowed: true,
    message: null,
  };
}

function isDecklistSubmissionAvailable(tournament) {
  const now = new Date();

  if (!tournament.is_decklist_submit_open) {
    return {
      allowed: false,
      message: 'La carga de decklist está cerrada',
    };
  }

  if (
    tournament.decklist_closes_at &&
    new Date(tournament.decklist_closes_at) < now
  ) {
    return {
      allowed: false,
      message: 'La carga de decklist ya cerró',
    };
  }

  if (tournament.lifecycle_status === 'finished') {
    return {
      allowed: false,
      message: 'El torneo ya finalizó',
    };
  }

  return {
    allowed: true,
    message: null,
  };
}

async function getRegisteredTournamentRegistration(tournamentId, userId) {
  return TournamentRegistrations.findOne({
    where: {
      tournament_id: tournamentId,
      user_id: userId,
      registration_status: 'registered',
    },
  });
}

function buildDigimonCardImageUrl(code) {
  if (!code) return null;
  return `https://images.digimoncard.io/images/cards/${code}.webp`;
}

function detectDecklistInputFormat(value = '') {
  const raw = value.trim();

  if (!raw) {
    throw new Error('Debés pegar un decklist');
  }

  if (raw.startsWith('[') && raw.endsWith(']')) {
    try {
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        return 'tts';
      }
    } catch (error) {
      // sigue como text
    }
  }

  return 'text';
}

function parseTextDecklist(rawInput = '') {
  const lines = rawInput
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const cards = [];
  let sortOrder = 1;

  for (const line of lines) {
    if (line.startsWith('//')) continue;

    const match = line.match(/^(\d+)\s+(.+?)\s+([A-Z0-9]+-\d+)$/i);

    if (!match) continue;

    const quantity = Number(match[1]);
    const name = match[2].trim();
    const code = match[3].trim().toUpperCase();

    if (!quantity || !code) continue;

    cards.push({
      quantity,
      name,
      code,
      image_url: buildDigimonCardImageUrl(code),
      sort_order: sortOrder,
    });

    sortOrder += 1;
  }

  return cards;
}

function parseTtsDecklist(rawInput = '') {
  let parsed;

  try {
    parsed = JSON.parse(rawInput);
  } catch (error) {
    throw new Error('El decklist en formato TTS no es válido');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('El decklist en formato TTS no es válido');
  }

  const counts = new Map();
  const order = [];

  for (const item of parsed) {
    if (typeof item !== 'string') continue;

    const value = item.trim();

    if (!value || value.startsWith('Exported from')) continue;

    const code = value.toUpperCase();

    if (!/^[A-Z0-9]+-\d+$/i.test(code)) continue;

    if (!counts.has(code)) {
      counts.set(code, 0);
      order.push(code);
    }

    counts.set(code, counts.get(code) + 1);
  }

  return order.map((code, index) => ({
    quantity: counts.get(code),
    name: null,
    code,
    image_url: buildDigimonCardImageUrl(code),
    sort_order: index + 1,
  }));
}

function normalizeDecklistPayload(body = {}) {
  const rawInput = body.raw_input?.trim() || '';

  if (!rawInput) {
    throw new Error('Debés pegar un decklist');
  }

  const inputFormat = detectDecklistInputFormat(rawInput);

  const parsedCards =
    inputFormat === 'tts'
      ? parseTtsDecklist(rawInput)
      : parseTextDecklist(rawInput);

  if (parsedCards.length === 0) {
    throw new Error('No se pudo interpretar el decklist');
  }

  return {
    deck_name: null,
    input_format: inputFormat,
    raw_text: inputFormat === 'text' ? rawInput : null,
    raw_tts: inputFormat === 'tts' ? rawInput : null,
    parsed_cards_json: JSON.stringify(parsedCards),
  };
}

async function validateCatalogReferences(payload) {
  const [
    format,
    pointStructure,
    registrationMode,
    pairingSystem,
    matchMode,
  ] = await Promise.all([
    TournamentFormats.findByPk(payload.format_id),
    TournamentPointStructures.findByPk(payload.point_structure_id),
    TournamentRegistrationModes.findByPk(payload.registration_mode_id),
    TournamentPairingSystems.findByPk(payload.pairing_system_id),
    TournamentMatchModes.findByPk(payload.match_mode_id),
  ]);

  if (!format) throw new Error('Formato de torneo inválido');
  if (!pointStructure) throw new Error('Estructura de puntos inválida');
  if (!registrationMode) throw new Error('Modo de registro inválido');
  if (!pairingSystem) throw new Error('Sistema de emparejamiento inválido');
  if (!matchMode) throw new Error('Modo de match inválido');
}

export async function getTournamentCatalogs(req, res) {
  try {
    const [
      formats,
      pointStructures,
      registrationModes,
      pairingSystems,
      matchModes,
    ] = await Promise.all([
      TournamentFormats.findAll({ where: { is_active: true }, order: [['name', 'ASC']] }),
      TournamentPointStructures.findAll({ order: [['id', 'ASC']] }),
      TournamentRegistrationModes.findAll({ order: [['id', 'ASC']] }),
      TournamentPairingSystems.findAll({ order: [['id', 'ASC']] }),
      TournamentMatchModes.findAll({ order: [['id', 'ASC']] }),
    ]);

    return res.status(200).json({
      ok: true,
      formats,
      point_structures: pointStructures,
      registration_modes: registrationModes,
      pairing_systems: pairingSystems,
      match_modes: matchModes,
      event_modes: [
        { code: 'in_person', name: 'Presencial' },
        { code: 'online', name: 'Online' },
      ],
    });
  } catch (error) {
    console.error('getTournamentCatalogs error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener catálogos',
    });
  }
}

export async function getNodeTournaments(req, res) {
  try {
    const { organizationId, nodeId } = req.params;

    const membership = await getMembership(req.user.id, organizationId);

    if (!membership) {
      return res.status(403).json({
        ok: false,
        message: 'No pertenecés a esta organización',
      });
    }

    const tournaments = await Tournaments.findAll({
      where: {
        organization_id: organizationId,
        organization_node_id: nodeId,
      },
      include: [
        { model: TournamentFormats, as: 'format' },
        { model: TournamentMatchModes, as: 'matchMode' },
        { model: TournamentPairingSystems, as: 'pairingSystem' },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      ok: true,
      tournaments,
    });
  } catch (error) {
    console.error('getNodeTournaments error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener torneos',
    });
  }
}

export async function getTournamentById(req, res) {
  try {
    const { id } = req.params;

    const tournament = await Tournaments.findByPk(id, {
      include: [
        { model: TournamentFormats, as: 'format' },
        { model: TournamentPointStructures, as: 'pointStructure' },
        { model: TournamentRegistrationModes, as: 'registrationMode' },
        { model: TournamentPairingSystems, as: 'pairingSystem' },
        { model: TournamentMatchModes, as: 'matchMode' },
        { model: TournamentRoundRules, as: 'roundRules' },
        { model: TournamentStaff, as: 'staff' },
      ],
    });

    if (!tournament) {
      return res.status(404).json({
        ok: false,
        message: 'Torneo no encontrado',
      });
    }

    const membership = await getMembership(req.user.id, tournament.organization_id);

    if (!membership) {
      return res.status(403).json({
        ok: false,
        message: 'No pertenecés a esta organización',
      });
    }

    return res.status(200).json({
      ok: true,
      tournament,
    });
  } catch (error) {
    console.error('getTournamentById error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener el torneo',
    });
  }
}

export async function createTournament(req, res) {
  try {
    const {
      organization_id,
      organization_node_id,
      name,
      description_html,
      event_mode = 'in_person',
      format_id,
      point_structure_id,
      registration_mode_id,
      pairing_system_id,
      match_mode_id,
      registration_opens_at,
      registration_closes_at,
      decklist_closes_at,
      starts_at,
      is_registration_open,
      is_decklist_submit_open,
      is_decklist_required,
      can_view_decklists,
      show_deck_name,
      show_decklists_after_tournament,
      allow_sideboard,
      remove_dropped_players,
      player_limit_enabled,
      max_players,
      round_limits_enabled,
      registration_code,
      round_rules = [],
      staff = [],
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        ok: false,
        message: 'El nombre del torneo es obligatorio',
      });
    }

    const membership = await getMembership(req.user.id, organization_id);

    if (!membership) {
      return res.status(403).json({
        ok: false,
        message: 'No pertenecés a esta organización',
      });
    }

    const permissionCodes = await getEffectiveOrganizationPermissionCodes(membership);

    if (!canCreateTournaments(membership, permissionCodes)) {
      return res.status(403).json({
        ok: false,
        message: 'No tenés permisos para crear torneos',
      });
    }

    const node = await OrganizationNodes.findOne({
      where: {
        id: organization_node_id,
        organization_id,
        deleted_at: null,
      },
    });

    if (!node) {
      return res.status(404).json({
        ok: false,
        message: 'La carpeta seleccionada no existe',
      });
    }

    await validateCatalogReferences({
      format_id,
      point_structure_id,
      registration_mode_id,
      pairing_system_id,
      match_mode_id,
    });

    const baseSlug = slugify(name);
    const finalSlug = await ensureUniqueTournamentSlug(baseSlug);

    const tournament = await Tournaments.create({
      organization_id,
      organization_node_id,
      created_by_user_id: req.user.id,
      name: name.trim(),
      slug: finalSlug,
      description_html: description_html || null,
      event_mode: event_mode || 'in_person',
      lifecycle_status: 'draft',
      format_id,
      point_structure_id,
      registration_mode_id,
      pairing_system_id,
      match_mode_id,
      registration_opens_at: registration_opens_at || null,
      registration_closes_at: registration_closes_at || null,
      decklist_closes_at: decklist_closes_at || null,
      starts_at: starts_at || null,
      is_registration_open: toBool(is_registration_open),
      is_decklist_submit_open: toBool(is_decklist_submit_open),
      is_decklist_required: toBool(is_decklist_required, true),
      can_view_decklists: toBool(can_view_decklists),
      show_deck_name: toBool(show_deck_name, true),
      show_decklists_after_tournament: toBool(show_decklists_after_tournament),
      allow_sideboard: toBool(allow_sideboard, true),
      remove_dropped_players: toBool(remove_dropped_players),
      player_limit_enabled: toBool(player_limit_enabled),
      max_players: toBool(player_limit_enabled) ? Number(max_players || 0) || null : null,
      round_limits_enabled: toBool(round_limits_enabled),
      registration_code: registration_code?.trim() || null,
    });

    const normalizedRules = normalizeRoundRules(round_rules);

    if (normalizedRules.length > 0) {
      await TournamentRoundRules.bulkCreate(
        normalizedRules.map((rule) => ({
          tournament_id: tournament.id,
          ...rule,
        }))
      );
    }

    const normalizedStaff = normalizeStaff(staff);

    if (normalizedStaff.length > 0) {
      await TournamentStaff.bulkCreate(
        normalizedStaff.map((item) => ({
          tournament_id: tournament.id,
          ...item,
        }))
      );
    }

    await node.update({
      contains_tournaments: true,
    });

    return res.status(201).json({
      ok: true,
      message: 'Torneo creado correctamente',
      tournament_id: tournament.id,
    });
  } catch (error) {
    console.error('createTournament error:', error);

    if (error.message) {
      return res.status(400).json({
        ok: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      ok: false,
      message: 'Error interno al crear el torneo',
    });
  }
}

export async function updateTournament(req, res) {
  try {
    const { id } = req.params;

    const tournament = await Tournaments.findByPk(id);

    if (!tournament) {
      return res.status(404).json({
        ok: false,
        message: 'Torneo no encontrado',
      });
    }

    const membership = await getMembership(req.user.id, tournament.organization_id);

    if (!membership) {
      return res.status(403).json({
        ok: false,
        message: 'No pertenecés a esta organización',
      });
    }

    const permissionCodes = await getEffectiveOrganizationPermissionCodes(membership);

    if (!canManageTournament(membership, permissionCodes)) {
      return res.status(403).json({
        ok: false,
        message: 'No tenés permisos para editar este torneo',
      });
    }

    const payload = req.body;

    if (payload.name && !payload.name.trim()) {
      return res.status(400).json({
        ok: false,
        message: 'El nombre del torneo no puede estar vacío',
      });
    }

    if (
      payload.format_id ||
      payload.point_structure_id ||
      payload.registration_mode_id ||
      payload.pairing_system_id ||
      payload.match_mode_id
    ) {
      await validateCatalogReferences({
        format_id: payload.format_id || tournament.format_id,
        point_structure_id: payload.point_structure_id || tournament.point_structure_id,
        registration_mode_id: payload.registration_mode_id || tournament.registration_mode_id,
        pairing_system_id: payload.pairing_system_id || tournament.pairing_system_id,
        match_mode_id: payload.match_mode_id || tournament.match_mode_id,
      });
    }

    const updateData = {
      ...(payload.name ? { name: payload.name.trim() } : {}),
      ...(payload.description_html !== undefined
        ? { description_html: payload.description_html || null }
        : {}),
      ...(payload.event_mode ? { event_mode: payload.event_mode } : {}),
      ...(payload.format_id ? { format_id: payload.format_id } : {}),
      ...(payload.point_structure_id ? { point_structure_id: payload.point_structure_id } : {}),
      ...(payload.registration_mode_id ? { registration_mode_id: payload.registration_mode_id } : {}),
      ...(payload.pairing_system_id ? { pairing_system_id: payload.pairing_system_id } : {}),
      ...(payload.match_mode_id ? { match_mode_id: payload.match_mode_id } : {}),
      ...(payload.registration_opens_at !== undefined
        ? { registration_opens_at: payload.registration_opens_at || null }
        : {}),
      ...(payload.registration_closes_at !== undefined
        ? { registration_closes_at: payload.registration_closes_at || null }
        : {}),
      ...(payload.decklist_closes_at !== undefined
        ? { decklist_closes_at: payload.decklist_closes_at || null }
        : {}),
      ...(payload.starts_at !== undefined ? { starts_at: payload.starts_at || null } : {}),
      ...(payload.is_registration_open !== undefined
        ? { is_registration_open: toBool(payload.is_registration_open) }
        : {}),
      ...(payload.is_decklist_submit_open !== undefined
        ? { is_decklist_submit_open: toBool(payload.is_decklist_submit_open) }
        : {}),
      ...(payload.is_decklist_required !== undefined
        ? { is_decklist_required: toBool(payload.is_decklist_required) }
        : {}),
      ...(payload.can_view_decklists !== undefined
        ? { can_view_decklists: toBool(payload.can_view_decklists) }
        : {}),
      ...(payload.show_deck_name !== undefined
        ? { show_deck_name: toBool(payload.show_deck_name) }
        : {}),
      ...(payload.show_decklists_after_tournament !== undefined
        ? { show_decklists_after_tournament: toBool(payload.show_decklists_after_tournament) }
        : {}),
      ...(payload.allow_sideboard !== undefined
        ? { allow_sideboard: toBool(payload.allow_sideboard) }
        : {}),
      ...(payload.remove_dropped_players !== undefined
        ? { remove_dropped_players: toBool(payload.remove_dropped_players) }
        : {}),
      ...(payload.player_limit_enabled !== undefined
        ? { player_limit_enabled: toBool(payload.player_limit_enabled) }
        : {}),
      ...(payload.max_players !== undefined
        ? { max_players: payload.max_players ? Number(payload.max_players) : null }
        : {}),
      ...(payload.round_limits_enabled !== undefined
        ? { round_limits_enabled: toBool(payload.round_limits_enabled) }
        : {}),
      ...(payload.registration_code !== undefined
        ? { registration_code: payload.registration_code?.trim() || null }
        : {}),
      ...(payload.lifecycle_status ? { lifecycle_status: payload.lifecycle_status } : {}),
    };

    if (payload.name && payload.name.trim() !== tournament.name) {
      updateData.slug = await ensureUniqueTournamentSlug(slugify(payload.name));
    }

    await tournament.update(updateData);

    if (Array.isArray(payload.round_rules)) {
      await TournamentRoundRules.destroy({
        where: { tournament_id: tournament.id },
      });

      const normalizedRules = normalizeRoundRules(payload.round_rules);

      if (normalizedRules.length > 0) {
        await TournamentRoundRules.bulkCreate(
          normalizedRules.map((rule) => ({
            tournament_id: tournament.id,
            ...rule,
          }))
        );
      }
    }

    if (Array.isArray(payload.staff)) {
      await TournamentStaff.destroy({
        where: { tournament_id: tournament.id },
      });

      const normalizedStaff = normalizeStaff(payload.staff);

      if (normalizedStaff.length > 0) {
        await TournamentStaff.bulkCreate(
          normalizedStaff.map((item) => ({
            tournament_id: tournament.id,
            ...item,
          }))
        );
      }
    }

    return res.status(200).json({
      ok: true,
      message: 'Torneo actualizado correctamente',
    });
  } catch (error) {
    console.error('updateTournament error:', error);

    if (error.message) {
      return res.status(400).json({
        ok: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      ok: false,
      message: 'Error interno al actualizar el torneo',
    });
  }
}

async function cloneTournamentData({
  sourceTournament,
  targetNodeId,
  userId,
}) {
  const clonedName = `${sourceTournament.name} copia`;
  const clonedSlug = await ensureUniqueTournamentSlug(slugify(clonedName));

  const clonedTournament = await Tournaments.create({
    organization_id: sourceTournament.organization_id,
    organization_node_id: targetNodeId,
    created_by_user_id: userId,
    cloned_from_tournament_id: sourceTournament.id,
    name: clonedName,
    slug: clonedSlug,
    description_html: sourceTournament.description_html,
    event_mode: sourceTournament.event_mode,
    lifecycle_status: 'draft',
    format_id: sourceTournament.format_id,
    point_structure_id: sourceTournament.point_structure_id,
    registration_mode_id: sourceTournament.registration_mode_id,
    pairing_system_id: sourceTournament.pairing_system_id,
    match_mode_id: sourceTournament.match_mode_id,
    registration_opens_at: null,
    registration_closes_at: null,
    decklist_closes_at: null,
    starts_at: null,
    finished_at: null,
    is_registration_open: false,
    is_decklist_submit_open: false,
    is_decklist_required: sourceTournament.is_decklist_required,
    can_view_decklists: sourceTournament.can_view_decklists,
    show_deck_name: sourceTournament.show_deck_name,
    show_decklists_after_tournament:
      sourceTournament.show_decklists_after_tournament,
    allow_sideboard: sourceTournament.allow_sideboard,
    remove_dropped_players: sourceTournament.remove_dropped_players,
    player_limit_enabled: sourceTournament.player_limit_enabled,
    max_players: sourceTournament.max_players,
    round_limits_enabled: sourceTournament.round_limits_enabled,
    registration_code: null,
  });

  if (sourceTournament.roundRules?.length > 0) {
    await TournamentRoundRules.bulkCreate(
      sourceTournament.roundRules.map((rule) => ({
        tournament_id: clonedTournament.id,
        min_players: rule.min_players,
        max_players: rule.max_players,
        rounds_count: rule.rounds_count,
        sort_order: rule.sort_order,
      }))
    );
  }

  if (sourceTournament.staff?.length > 0) {
    await TournamentStaff.bulkCreate(
      sourceTournament.staff.map((staffItem) => ({
        tournament_id: clonedTournament.id,
        organization_member_id: staffItem.organization_member_id,
        role_label: staffItem.role_label,
        can_manage_registrations: staffItem.can_manage_registrations,
        can_manage_decklists: staffItem.can_manage_decklists,
        can_manage_pairings: staffItem.can_manage_pairings,
        can_submit_results: staffItem.can_submit_results,
        can_edit_tournament: staffItem.can_edit_tournament,
      }))
    );
  }

  const targetNode = await OrganizationNodes.findByPk(targetNodeId);
  if (targetNode) {
    await targetNode.update({
      contains_tournaments: true,
    });
  }

  return clonedTournament;
}

export async function cloneTournament(req, res) {
  try {
    const { id } = req.params;

    const sourceTournament = await Tournaments.findByPk(id, {
      include: [
        { model: TournamentRoundRules, as: 'roundRules' },
        { model: TournamentStaff, as: 'staff' },
      ],
    });

    if (!sourceTournament) {
      return res.status(404).json({
        ok: false,
        message: 'Torneo no encontrado',
      });
    }

    const membership = await getMembership(
      req.user.id,
      sourceTournament.organization_id
    );

    if (!membership) {
      return res.status(403).json({
        ok: false,
        message: 'No pertenecés a esta organización',
      });
    }

    const permissionCodes = await getEffectiveOrganizationPermissionCodes(
      membership
    );

    if (!canManageTournament(membership, permissionCodes)) {
      return res.status(403).json({
        ok: false,
        message: 'No tenés permisos para clonar este torneo',
      });
    }

    await validateTournamentTargetNode(
      sourceTournament.organization_id,
      sourceTournament.organization_node_id
    );

    const clonedTournament = await cloneTournamentData({
      sourceTournament,
      targetNodeId: sourceTournament.organization_node_id,
      userId: req.user.id,
    });

    return res.status(201).json({
      ok: true,
      message: 'Torneo clonado correctamente',
      tournament_id: clonedTournament.id,
    });
  } catch (error) {
    console.error('cloneTournament error:', error);

    if (error.message) {
      return res.status(400).json({
        ok: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      ok: false,
      message: 'Error interno al clonar el torneo',
    });
  }
}

export async function exportTournament(req, res) {
  try {
    const { id } = req.params;
    const { target_node_id } = req.body;

    if (!target_node_id) {
      return res.status(400).json({
        ok: false,
        message: 'Debés seleccionar una carpeta destino',
      });
    }

    const sourceTournament = await Tournaments.findByPk(id, {
      include: [
        { model: TournamentRoundRules, as: 'roundRules' },
        { model: TournamentStaff, as: 'staff' },
      ],
    });

    if (!sourceTournament) {
      return res.status(404).json({
        ok: false,
        message: 'Torneo no encontrado',
      });
    }

    const membership = await getMembership(
      req.user.id,
      sourceTournament.organization_id
    );

    if (!membership) {
      return res.status(403).json({
        ok: false,
        message: 'No pertenecés a esta organización',
      });
    }

    const permissionCodes = await getEffectiveOrganizationPermissionCodes(
      membership
    );

    if (!canManageTournament(membership, permissionCodes)) {
      return res.status(403).json({
        ok: false,
        message: 'No tenés permisos para exportar este torneo',
      });
    }

    await validateTournamentTargetNode(
      sourceTournament.organization_id,
      Number(target_node_id)
    );

    const clonedTournament = await cloneTournamentData({
      sourceTournament,
      targetNodeId: Number(target_node_id),
      userId: req.user.id,
    });

    return res.status(201).json({
      ok: true,
      message: 'Torneo exportado correctamente',
      tournament_id: clonedTournament.id,
    });
  } catch (error) {
    console.error('exportTournament error:', error);

    if (error.message) {
      return res.status(400).json({
        ok: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      ok: false,
      message: 'Error interno al exportar el torneo',
    });
  }
}

async function validateTournamentTargetNode(organizationId, targetNodeId) {
  const targetNode = await OrganizationNodes.findOne({
    where: {
      id: targetNodeId,
      organization_id: organizationId,
      deleted_at: null,
    },
  });

  if (!targetNode) {
    throw new Error('La carpeta destino no existe');
  }

  const childrenCount = await OrganizationNodes.count({
    where: {
      parent_id: targetNode.id,
      deleted_at: null,
    },
  });

  if (childrenCount > 0) {
    throw new Error(
      'No podés usar una carpeta que ya contiene subcarpetas'
    );
  }

  return targetNode;
}

export async function deleteTournament(req, res) {
  try {
    const { id } = req.params;
    const { current_password } = req.body;

    if (!current_password) {
      return res.status(400).json({
        ok: false,
        message: 'Debés ingresar tu contraseña',
      });
    }

    const tournament = await Tournaments.findByPk(id);

    if (!tournament) {
      return res.status(404).json({
        ok: false,
        message: 'Torneo no encontrado',
      });
    }

    const membership = await getMembership(
      req.user.id,
      tournament.organization_id
    );

    if (!membership) {
      return res.status(403).json({
        ok: false,
        message: 'No pertenecés a esta organización',
      });
    }

    const permissionCodes = await getEffectiveOrganizationPermissionCodes(
      membership
    );

    if (!canManageTournament(membership, permissionCodes)) {
      return res.status(403).json({
        ok: false,
        message: 'No tenés permisos para eliminar este torneo',
      });
    }

    if (tournament.lifecycle_status !== 'draft') {
      return res.status(400).json({
        ok: false,
        message: 'Solo se pueden eliminar torneos en estado draft',
      });
    }

    const user = await User.scope('withPassword').findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
      });
    }

    const isValidPassword = await bcrypt.compare(
      current_password,
      user.password_hash
    );

    if (!isValidPassword) {
      return res.status(401).json({
        ok: false,
        message: 'La contraseña es incorrecta',
      });
    }

    const nodeId = tournament.organization_node_id;

    await TournamentRoundRules.destroy({
      where: { tournament_id: tournament.id },
    });

    await TournamentStaff.destroy({
      where: { tournament_id: tournament.id },
    });

    await TournamentAccessCodes.destroy({
      where: { tournament_id: tournament.id },
    });

    await Tournaments.destroy({
      where: { id: tournament.id },
    });

    const remainingTournaments = await Tournaments.count({
      where: {
        organization_node_id: nodeId,
      },
    });

    if (remainingTournaments === 0) {
      const node = await OrganizationNodes.findByPk(nodeId);

      if (node) {
        await node.update({
          contains_tournaments: false,
        });
      }
    }

    return res.status(200).json({
      ok: true,
      message: 'Torneo eliminado correctamente',
    });
  } catch (error) {
    console.error('deleteTournament error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error interno al eliminar el torneo',
      error: error.message,
    });
  }
}

export async function getPublicTournamentBySlug(req, res) {
  try {
    const { slug } = req.params;

    const tournament = await Tournaments.findOne({
      where: { slug },
      include: [
        { model: TournamentFormats, as: 'format' },
        { model: TournamentPointStructures, as: 'pointStructure' },
        { model: TournamentRegistrationModes, as: 'registrationMode' },
        { model: TournamentPairingSystems, as: 'pairingSystem' },
        { model: TournamentMatchModes, as: 'matchMode' },
      ],
    });

    if (!tournament) {
      return res.status(404).json({
        ok: false,
        message: 'Torneo no encontrado',
      });
    }

    const registrations = await TournamentRegistrations.findAll({
      where: {
        tournament_id: tournament.id,
        registration_status: 'registered',
      },
      order: [['created_at', 'ASC']],
      attributes: [
        'id',
        'display_name_snapshot',
        'created_at',
      ],
    });

    const decklists = await TournamentDecklists.findAll({
      where: {
        tournament_id: tournament.id,
      },
      attributes: ['tournament_registration_id'],
    });

    const decklistRegistrationIds = new Set(
      decklists.map((item) => item.tournament_registration_id)
    );

    const serializedRegistrations = registrations.map((item) => ({
      id: item.id,
      display_name_snapshot: item.display_name_snapshot,
      created_at: item.createdAt,
      has_decklist: decklistRegistrationIds.has(item.id),
    }));

    const registrationState = isTournamentRegistrationAvailable(tournament);

    return res.status(200).json({
      ok: true,
      tournament: {
        id: tournament.id,
        name: tournament.name,
        slug: tournament.slug,
        description_html: tournament.description_html,
        event_mode: tournament.event_mode,
        lifecycle_status: tournament.lifecycle_status,
        registration_opens_at: tournament.registration_opens_at,
        registration_closes_at: tournament.registration_closes_at,
        decklist_closes_at: tournament.decklist_closes_at,
        starts_at: tournament.starts_at,

        is_registration_open: tournament.is_registration_open,
        is_decklist_submit_open: tournament.is_decklist_submit_open,

        is_decklist_required: tournament.is_decklist_required,
        can_view_decklists: tournament.can_view_decklists,
        show_deck_name: tournament.show_deck_name,
        show_decklists_after_tournament:
          tournament.show_decklists_after_tournament,
        allow_sideboard: tournament.allow_sideboard,

        player_limit_enabled: tournament.player_limit_enabled,
        max_players: tournament.max_players,

        format: tournament.format,
        pointStructure: tournament.pointStructure,
        registrationMode: tournament.registrationMode,
        pairingSystem: tournament.pairingSystem,
        matchMode: tournament.matchMode,

        registrations_count: serializedRegistrations.length,
        registrations: serializedRegistrations,
        registration_available: registrationState.allowed,
        registration_message: registrationState.message,
      },
    });
  } catch (error) {
    console.error('getPublicTournamentBySlug error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener el torneo público',
      error: error.message,
    });
  }
}

export async function registerToTournament(req, res) {
  try {
    const { id } = req.params;
    const { registration_code } = req.body;

    const tournament = await Tournaments.findByPk(id, {
      include: [{ model: TournamentRegistrationModes, as: 'registrationMode' }],
    });

    if (!tournament) {
      return res.status(404).json({
        ok: false,
        message: 'Torneo no encontrado',
      });
    }

    const registrationState = isTournamentRegistrationAvailable(tournament);

    if (!registrationState.allowed) {
      return res.status(400).json({
        ok: false,
        message: registrationState.message,
      });
    }

    const existingRegistration = await TournamentRegistrations.findOne({
      where: {
        tournament_id: tournament.id,
        user_id: req.user.id,
      },
    });

    if (existingRegistration?.registration_status === 'registered') {
      return res.status(400).json({
        ok: false,
        message: 'Ya estás registrado en este torneo',
      });
    }

    const registeredPlayersCount = await TournamentRegistrations.count({
      where: {
        tournament_id: tournament.id,
        registration_status: 'registered',
      },
    });

    if (
      tournament.player_limit_enabled &&
      tournament.max_players &&
      registeredPlayersCount >= tournament.max_players
    ) {
      return res.status(400).json({
        ok: false,
        message: 'El torneo ya alcanzó el máximo de jugadores',
      });
    }

    let registrationSource = 'open';
    let registrationCodeUsed = null;

    if (tournament.registrationMode?.code === 'shared_code') {
      if (!registration_code?.trim()) {
        return res.status(400).json({
          ok: false,
          message: 'Debés ingresar el código del torneo',
        });
      }

      if (registration_code.trim() !== tournament.registration_code) {
        return res.status(400).json({
          ok: false,
          message: 'El código del torneo es incorrecto',
        });
      }

      registrationSource = 'shared_code';
      registrationCodeUsed = registration_code.trim();
    }

    if (tournament.registrationMode?.code === 'single_use_code') {
      if (!registration_code?.trim()) {
        return res.status(400).json({
          ok: false,
          message: 'Debés ingresar un código válido',
        });
      }

      const accessCode = await TournamentAccessCodes.findOne({
        where: {
          tournament_id: tournament.id,
          code: registration_code.trim(),
          is_active: true,
        },
      });

      if (!accessCode) {
        return res.status(400).json({
          ok: false,
          message: 'El código es inválido',
        });
      }

      if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
        return res.status(400).json({
          ok: false,
          message: 'El código ya venció',
        });
      }

      if (accessCode.used_count >= accessCode.max_uses) {
        return res.status(400).json({
          ok: false,
          message: 'El código ya fue utilizado',
        });
      }

      await accessCode.update({
        used_count: accessCode.used_count + 1,
        is_active: accessCode.used_count + 1 < accessCode.max_uses,
      });

      registrationSource = 'single_use_code';
      registrationCodeUsed = registration_code.trim();
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
      });
    }

    const firstName = user.first_name?.trim() || '';
    const lastName = user.last_name?.trim() || '';
    const displayName = `${firstName} ${lastName}`.trim();

    if (!firstName || !lastName) {
      return res.status(400).json({
        ok: false,
        message: 'Tu cuenta debe tener nombre y apellido para registrarte',
      });
    }

    const registeredAt = new Date();

    let registration;

    if (existingRegistration) {
      registration = await existingRegistration.update({
        first_name_snapshot: firstName,
        last_name_snapshot: lastName,
        display_name_snapshot: displayName,
        registration_status: 'registered',
        registration_source: registrationSource,
        registration_code_used: registrationCodeUsed,
        registered_at: registeredAt,
      });
    } else {
      registration = await TournamentRegistrations.create({
        tournament_id: tournament.id,
        user_id: req.user.id,
        first_name_snapshot: firstName,
        last_name_snapshot: lastName,
        display_name_snapshot: displayName,
        registration_status: 'registered',
        registration_source: registrationSource,
        registration_code_used: registrationCodeUsed,
        registered_at: registeredAt,
      });
    }

    return res.status(201).json({
      ok: true,
      message: 'Te registraste correctamente al torneo',
      registration,
    });
  } catch (error) {
    console.error('registerToTournament error:', error);

    if (error.message) {
      return res.status(400).json({
        ok: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      ok: false,
      message: 'Error interno al registrarte en el torneo',
    });
  }
}
export async function getMyTournamentRegistration(req, res) {
  try {
    const { id } = req.params;

    const registration = await TournamentRegistrations.findOne({
      where: {
        tournament_id: id,
        user_id: req.user.id,
      },
    });

    return res.status(200).json({
      ok: true,
      registration,
      is_registered: !!registration,
    });
  } catch (error) {
    console.error('getMyTournamentRegistration error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener tu inscripción',
    });
  }
}

export async function unregisterFromTournament(req, res) {
  try {
    const { id } = req.params;

    const tournament = await Tournaments.findByPk(id);

    if (!tournament) {
      return res.status(404).json({
        ok: false,
        message: 'Torneo no encontrado',
      });
    }

    const registration = await TournamentRegistrations.findOne({
      where: {
        tournament_id: tournament.id,
        user_id: req.user.id,
        registration_status: 'registered',
      },
    });

    if (!registration) {
      return res.status(404).json({
        ok: false,
        message: 'No estás registrado en este torneo',
      });
    }

    await TournamentDecklists.destroy({
      where: {
        tournament_id: tournament.id,
        user_id: req.user.id,
        tournament_registration_id: registration.id,
      },
      force: true,
    });

    await registration.update({
      registration_status: 'cancelled',
    });

    return res.status(200).json({
      ok: true,
      message: 'Inscripción cancelada correctamente',
    });
  } catch (error) {
    console.error('unregisterFromTournament error:', error);

    return res.status(500).json({
      ok: false,
      message: 'No se pudo cancelar la inscripción',
    });
  }
}

export async function getMyTournamentDecklist(req, res) {
  try {
    const { id } = req.params;

    const tournament = await Tournaments.findByPk(id);

    if (!tournament) {
      return res.status(404).json({
        ok: false,
        message: 'Torneo no encontrado',
      });
    }

    const registration = await getRegisteredTournamentRegistration(
      tournament.id,
      req.user.id
    );

    if (!registration) {
      return res.status(403).json({
        ok: false,
        message: 'Tenés que estar registrado en el torneo',
      });
    }

    const decklist = await TournamentDecklists.findOne({
      where: {
        tournament_id: tournament.id,
        user_id: req.user.id,
      },
    });

    return res.status(200).json({
      ok: true,
      decklist: decklist
        ? {
          ...decklist.toJSON(),
          parsed_cards_json: decklist.parsed_cards_json
            ? JSON.parse(decklist.parsed_cards_json)
            : null,
        }
        : null,
    });
  } catch (error) {
    console.error('getMyTournamentDecklist error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener tu decklist',
    });
  }
}

export async function createTournamentDecklist(req, res) {
  try {
    const { id } = req.params;

    const tournament = await Tournaments.findByPk(id);

    if (!tournament) {
      return res.status(404).json({
        ok: false,
        message: 'Torneo no encontrado',
      });
    }

    const registration = await getRegisteredTournamentRegistration(
      tournament.id,
      req.user.id
    );

    if (!registration) {
      return res.status(403).json({
        ok: false,
        message: 'Tenés que estar registrado en el torneo',
      });
    }

    const submitState = isDecklistSubmissionAvailable(tournament);

    if (!submitState.allowed) {
      return res.status(400).json({
        ok: false,
        message: submitState.message,
      });
    }

    const existingDecklist = await TournamentDecklists.findOne({
      where: {
        tournament_id: tournament.id,
        user_id: req.user.id,
      },
    });

    if (existingDecklist) {
      return res.status(400).json({
        ok: false,
        message: 'Ya tenés un decklist cargado para este torneo',
      });
    }

    const normalizedPayload = normalizeDecklistPayload(req.body);

    const decklist = await TournamentDecklists.create({
      tournament_id: tournament.id,
      user_id: req.user.id,
      tournament_registration_id: registration.id,
      ...normalizedPayload,
      submitted_at: new Date(),
    });

    return res.status(201).json({
      ok: true,
      message: 'Decklist cargado correctamente',
      decklist: {
        ...decklist.toJSON(),
        parsed_cards_json: decklist.parsed_cards_json
          ? JSON.parse(decklist.parsed_cards_json)
          : null,
      },
    });
  } catch (error) {
    console.error('createTournamentDecklist error:', error);

    if (error.message) {
      return res.status(400).json({
        ok: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      ok: false,
      message: 'Error interno al cargar el decklist',
    });
  }
}

export async function updateTournamentDecklist(req, res) {
  try {
    const { id } = req.params;

    const tournament = await Tournaments.findByPk(id);

    if (!tournament) {
      return res.status(404).json({
        ok: false,
        message: 'Torneo no encontrado',
      });
    }

    const registration = await getRegisteredTournamentRegistration(
      tournament.id,
      req.user.id
    );

    if (!registration) {
      return res.status(403).json({
        ok: false,
        message: 'Tenés que estar registrado en el torneo',
      });
    }

    const submitState = isDecklistSubmissionAvailable(tournament);

    if (!submitState.allowed) {
      return res.status(400).json({
        ok: false,
        message: submitState.message,
      });
    }

    const decklist = await TournamentDecklists.findOne({
      where: {
        tournament_id: tournament.id,
        user_id: req.user.id,
      },
    });

    if (!decklist) {
      return res.status(404).json({
        ok: false,
        message: 'Todavía no cargaste un decklist',
      });
    }

    const normalizedPayload = normalizeDecklistPayload(req.body);

    await decklist.update({
      ...normalizedPayload,
      submitted_at: decklist.submitted_at || new Date(),
    });

    return res.status(200).json({
      ok: true,
      message: 'Decklist actualizado correctamente',
      decklist: {
        ...decklist.toJSON(),
        parsed_cards_json: decklist.parsed_cards_json
          ? JSON.parse(decklist.parsed_cards_json)
          : null,
      },
    });
  } catch (error) {
    console.error('updateTournamentDecklist error:', error);

    if (error.message) {
      return res.status(400).json({
        ok: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      ok: false,
      message: 'Error interno al actualizar el decklist',
    });
  }
}

export async function getPublicTournamentRegistrations(req, res) {
  try {
    const { slug } = req.params;

    const tournament = await Tournaments.findOne({
      where: { slug },
      attributes: ['id', 'name', 'slug', 'max_players', 'player_limit_enabled'],
    });

    if (!tournament) {
      return res.status(404).json({
        ok: false,
        message: 'Torneo no encontrado',
      });
    }

    const registrations = await TournamentRegistrations.findAll({
      where: {
        tournament_id: tournament.id,
        registration_status: 'registered',
      },
      attributes: ['id', 'display_name_snapshot', 'created_at'],
      order: [['created_at', 'ASC']],
      raw: true,
    });

    const decklists = await TournamentDecklists.findAll({
      where: {
        tournament_id: tournament.id,
      },
      attributes: ['tournament_registration_id'],
      raw: true,
    });

    const decklistRegistrationIds = new Set(
      decklists.map((item) => Number(item.tournament_registration_id))
    );

    const serializedRegistrations = registrations.map((item) => ({
      id: item.id,
      display_name_snapshot: item.display_name_snapshot,
      registered_at: item.created_at,
      has_decklist: decklistRegistrationIds.has(Number(item.id)),
    }));

    return res.status(200).json({
      ok: true,
      tournament: {
        id: tournament.id,
        name: tournament.name,
        slug: tournament.slug,
        max_players: tournament.max_players,
        player_limit_enabled: tournament.player_limit_enabled,
      },
      registrations: serializedRegistrations,
    });
  } catch (error) {
    console.error('getPublicTournamentRegistrations error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener los jugadores registrados',
    });
  }
}