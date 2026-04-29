import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const Tournaments = sequelize.define(
    'Tournaments',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        organization_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        organization_node_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        created_by_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cloned_from_tournament_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING(180),
            allowNull: false,
            unique: true,
        },

        description_html: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },

        lifecycle_status: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: 'draft',
        },

        format_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        point_structure_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        registration_mode_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        pairing_system_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        match_mode_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        registration_opens_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        registration_closes_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        decklist_closes_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        starts_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        finished_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        is_registration_open: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        is_decklist_submit_open: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        is_decklist_required: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        can_view_decklists: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        show_deck_name: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        show_decklists_after_tournament: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        allow_sideboard: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },

        remove_dropped_players: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        player_limit_enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        max_players: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        round_limits_enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        registration_code: {
            type: DataTypes.STRING(80),
            allowNull: true,
        },
        event_mode: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'in_person',
        },
    },
    {
        tableName: 'tournaments',
        timestamps: true,
        underscored: true,
    }
);