// Lets any section open a project's detail panel (owned by ProjectOrbit) without sharing state.
export const OPEN_PROJECT = "portfolio:open-project";

export function openProject(slug: string) {
  window.dispatchEvent(new CustomEvent<string>(OPEN_PROJECT, { detail: slug }));
}
