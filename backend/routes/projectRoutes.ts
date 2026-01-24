import { Router, Request, Response } from 'express';
import { requireAuth } from './auth.js';
import { pool } from '../database/connection.js'

const router: Router = Router();

// Projects in the database are stored as different types so they be displayed on the right pages
const ALLOWED_TYPES = ['regular', 'junk', 'featured'] as const;
type ProjectType = typeof ALLOWED_TYPES[number];

// This is to parse the string to check if it's an allowed type, if not throw an error
function parseType(type: string): ProjectType {
    if (!ALLOWED_TYPES.includes(type as ProjectType)) {
        throw new Error('Invalid type');
    }

    return type as ProjectType;
}

// Put a limiter on how many projects can be pulled to stop API abuse
function parseLimit(limit?: string): number {
    const n = Number(limit);

    if (!Number.isInteger(n) || n < 1) return 5;

    return Math.min(n, 20);
}

// Handeles the logic fo how many projects are pulled and what type are to be pulled
const getProjectsHandler = async (req: Request, res: Response) => {
    try {
        const type = parseType(req.params.type);
        let limit = null

        if (req.params.limit) {
            limit = parseLimit(req.params.limit);
        }

        const conditions = ['projects.hidden = FALSE'];

        // Handles changing the where clause conditions
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

router.get('/all/:type', requireAuth, getProjectsHandler);
router.get('/all/:type/:limit', requireAuth, getProjectsHandler);

// Gets on project by ID
router.get('/id/:id', requireAuth, async (req: Request, res: Response) => {
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