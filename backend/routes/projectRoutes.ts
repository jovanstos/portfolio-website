import { Router, Request, Response } from 'express';
import { pool } from '../database/connection.js'

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
    console.log("get");

    const result = await pool.query('SELECT * FROM projects');

    console.log(result);

    const data = {
        message: 'Hello, world!',
        timestamp: Date.now(),
        status: 200
    };

    res.json(data);
});

router.get('/:id', (req: Request, res: Response) => {
    const projectID = req.params.id;

    console.log("get id");

    const data = {
        message: 'Hello, world!',
        id: projectID,
        timestamp: Date.now(),
        status: 200
    };

    res.json(data);
});

export default router;