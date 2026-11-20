import type { ProgrammeId } from '../data/content';

/** Lets the guide drive the page: open the planner on a branch, or open a project idea. */
export const OPEN_PLANNER_EVENT = 'yantra:open-planner';
export const OPEN_IDEA_EVENT = 'yantra:open-idea';

export interface PlannerTarget {
  programme: ProgrammeId;
  branch?: string;
  /** Project type id (PROJECT_TYPES). */
  type?: string;
}

export function openPlanner(target: PlannerTarget) {
  window.dispatchEvent(new CustomEvent<PlannerTarget>(OPEN_PLANNER_EVENT, { detail: target }));
}

export function openIdea(id: string) {
  window.dispatchEvent(new CustomEvent<string>(OPEN_IDEA_EVENT, { detail: id }));
}
