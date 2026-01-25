export interface ProjectData {
    id: number;
    title: string;
    description: string;
    url: string;
    imagedescription: string;
    imageurl: string;
}

export interface ProjectContent {
    id: number;
    title: string;
    text: string;
    imagedescription: string;
    imageurl: string;
}

// The interface used for ONE project
export interface ProjectProps {
    id?: number;
    subHeading?: string;
    mainContent?: React.ReactNode | null;
}

// The type used for MANY projects
export type ProjectsProps = {
    title?: string;
    projectType?: string;
    subheading?: string;
};