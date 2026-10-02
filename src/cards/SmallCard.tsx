import ProjectCard from "./ProjectCard";
import type { CardProps } from "../types/cardTypes";
export default function SmallCard(props: CardProps) {
  return <ProjectCard {...props} variant="small" />;
}
