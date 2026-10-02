import ProjectCard from "./ProjectCard";
import type { CardProps } from "../types/cardTypes";
export default function LargeCard(props: CardProps) {
  return <ProjectCard {...props} variant="large" />;
}
