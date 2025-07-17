import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

export function Home() {
  return <h1 className="text-2xl">Hello</h1>;
}
