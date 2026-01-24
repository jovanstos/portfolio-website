import { Router, Request, Response } from 'express';
import { pool } from '../database/connection.js'
import { requireAuth } from './auth.js';

const router: Router = Router();

// Gets the correct projects content by ID
router.get('/id/:id', requireAuth, async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: 'Invalid ID' });
    }

    const query = `
    SELECT
    project_content.id,
    project_content.title,
    project_content.text,
    images.description AS imageDescription,
    images.url AS imageUrl
    FROM project_content
    JOIN images ON project_content.image_id = images.id
    WHERE
    project_content.project_id = $1
    `;

    const { rows } = await pool.query(query, [id]);

    res.json(rows);
});

export default router;