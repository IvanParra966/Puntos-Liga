import { Countries, Status } from '../../database/models/index.js';
import { Op } from 'sequelize';

export async function getCountries(req, res) {
    try {
        const countries = await Countries.findAll({
            include: [
                {
                    model: Status,
                    as: 'status',
                },
            ],
            order: [['name', 'ASC']],
        });

        return res.status(200).json({
            ok: true,
            countries,
        });
    } catch (error) {
        console.error('getCountries error:', error);
        return res.status(500).json({
            ok: false,
            message: 'Error interno al obtener países',
        });
    }
}