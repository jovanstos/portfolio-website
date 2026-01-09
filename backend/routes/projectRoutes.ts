import { Router, Request, Response } from 'express';
import { pool } from '../database/connection.js'

const router: Router = Router();

const ALLOWED_TYPES = ['regular', 'junk', 'featured'] as const;
type ProjectType = typeof ALLOWED_TYPES[number];

function parseType(type: string): ProjectType {
    if (!ALLOWED_TYPES.includes(type as ProjectType)) {
        throw new Error('Invalid type');
    }

    return type as ProjectType;
}

function parseLimit(limit?: string): number {
    const n = Number(limit);

    if (!Number.isInteger(n) || n < 1) return 5;

    return Math.min(n, 20);
}

const getProjectsHandler = async (req: Request, res: Response) => {
    try {
        const type = parseType(req.params.type);
        let limit = null

        if (req.params.limit) {
            limit = parseLimit(req.params.limit);
        }

        const conditions = ['projects.hidden = FALSE'];

        if (type === 'junk') conditions.push('projects.junk = TRUE');
        else if (type === 'featured') conditions.push('projects.featured = TRUE');
        else {
            if (limit) {
                conditions.push('projects.featured = FALSE');
            }
            conditions.push('projects.junk = FALSE');
        }

        const query = `
        SELECT
        projects.id,
        projects.title,
        projects.description,
        projects.url,
        images.description AS imageDescription,
        images.url AS imageUrl
        FROM projects
        JOIN images ON projects.image_id = images.id
        WHERE ${conditions.join(' AND ')}
        LIMIT $1
        `;

        const { rows } = await pool.query(query, [limit]);
        res.json(rows);
    } catch {
        res.status(400).json({ message: 'Invalid request' });
    }
};

router.get('/all/:type', getProjectsHandler);
router.get('/all/:type/:limit', getProjectsHandler);

router.get('/id/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: 'Invalid ID' });
    }

    const query = `
    SELECT
    projects.id,
    projects.title,
    projects.description,
    projects.url,
    images.description AS imageDescription,
    images.url AS imageUrl
    FROM projects
    JOIN images ON projects.image_id = images.id
    WHERE projects.hidden = FALSE
    AND projects.id = $1
    `;

    const { rows } = await pool.query(query, [id]);

    res.json(rows[0]);
});

export default router;