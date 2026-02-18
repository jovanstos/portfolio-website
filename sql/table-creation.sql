CREATE TABLE images (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT,
    description TEXT,
    url TEXT NOT NULL
);

CREATE TABLE projects (
    id INTEGER GENERATED ALWAYS AS IDENTITY  PRIMARY KEY,
    image_id INTEGER,
    title TEXT,
    description TEXT,
    url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    junk BOOLEAN DEFAULT FALSE,
    hidden BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_projects_image
        FOREIGN KEY (image_id)
        REFERENCES images(id)
        ON DELETE SET NULL
);

CREATE TABLE project_content (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT,
    project_id INTEGER,
    image_id INTEGER,
    text TEXT,
    CONSTRAINT fk_project_content_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_project_content_image
        FOREIGN KEY (image_id)
        REFERENCES images(id)
        ON DELETE SET NULL
);
