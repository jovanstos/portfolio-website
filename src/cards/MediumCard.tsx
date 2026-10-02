import ProjectCard from "./ProjectCard";
import type { CardProps } from "../types/cardTypes";
export default function MediumCard(props: CardProps) {
  return <ProjectCard {...props} variant="medium" />;
}
