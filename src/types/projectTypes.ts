export interface project {
    id: number;
    title: string;
    description: string;
    url: string;
    imagedescription: string;
    imageurl: string;
}

export interface projectContent {
    id: number;
    title: string;
    text: string;
    imagedescription: string;
    imageurl: string;
}

export interface projectProps {
    id?: number;
    subHeading?: string;
    mainContent?: React.ReactNode | null;
}