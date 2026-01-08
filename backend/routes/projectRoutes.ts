import { Router, Request, Response } from 'express';
import { pool } from '../database/connection.js'

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
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
    WHERE 
    projects.hidden IS FALSE 
    AND projects.junk IS FALSE
    AND projects.featured IS FALSE
    `

    const result = await pool.query(query);

    const data = result.rows;

    res.json(data);
});

router.get('/frontpage', async (req: Request, res: Response) => {
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
    WHERE 
    projects.hidden IS FALSE 
    AND projects.junk IS FALSE
    AND projects.featured IS FALSE
    LIMIT 5
    `

    const result = await pool.query(query);

    const data = result.rows;

    res.json(data);
});

router.get('/:id', async (req: Request, res: Response) => {
    const projectID = req.params.id;

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
    WHERE
    projects.id = ${projectID}
    `

    const result = await pool.query(query);

    const data = result.rows;

    res.json(data);
});

export default router;