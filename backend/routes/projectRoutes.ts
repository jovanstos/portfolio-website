import { Router } from "express";
export interface Database {
  query(
    sql: string,
    values?: unknown[],
  ): Promise<{ rows: Record<string, unknown>[] }>;
}
const types = ["all", "regular", "junk", "featured"];
const select = `SELECT projects.id, projects.title, projects.description, projects.url,
  images.description AS imagedescription, images.url AS imageurl FROM projects
  LEFT JOIN images ON projects.image_id = images.id`;
export function createProjectRoutes(db: Database) {
  const router = Router();
  router.get("/all/:type", async (req, res) => {
    const type = String(req.params.type);
    if (!types.includes(type))
      return res.status(400).json({ message: "Invalid project type" });
    const condition =
      type === "junk"
        ? "projects.junk = TRUE"
        : type === "featured"
          ? "projects.featured = TRUE"
          : type === "regular"
            ? "projects.featured = FALSE AND projects.junk = FALSE"
            : "projects.junk = FALSE";
    const { rows } = await db.query(
      `${select} WHERE projects.hidden = FALSE AND ${condition} ORDER BY projects.id DESC`,
    );
    return res.json(rows);
  });
  router.get("/id/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0)
      return res.status(400).json({ message: "Invalid project ID" });
    const { rows } = await db.query(
      `${select} WHERE projects.hidden = FALSE AND projects.id = $1`,
      [id],
    );
    return rows[0]
      ? res.json(rows[0])
      : res.status(404).json({ message: "Project not found" });
  });
  return router;
}
