import { Router } from "express";
import type { Database } from "./projectRoutes.js";
export function createProjectContentRoutes(db: Database) {
  const router = Router();
  router.get("/id/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0)
      return res.status(400).json({ message: "Invalid project ID" });
    const parent = await db.query(
      "SELECT id FROM projects WHERE id = $1 AND hidden = FALSE",
      [id],
    );
    if (!parent.rows[0])
      return res.status(404).json({ message: "Project not found" });
    const { rows } = await db.query(
      `SELECT project_content.id, project_content.title, project_content.text,
      images.description AS imagedescription, images.url AS imageurl FROM project_content
      LEFT JOIN images ON project_content.image_id = images.id WHERE project_content.project_id = $1 ORDER BY project_content.id`,
      [id],
    );
    return res.json(rows);
  });
  return router;
}
