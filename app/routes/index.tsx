import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

export function Home() {
  return "Hello World! This is my first Tanstack Start project.";
}
