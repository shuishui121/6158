import type { Mesh, Vector3 } from "@babylonjs/core";

export interface FacilityInfo {
  id: string;
  name: string;
  type: string;
  description: string;
  specs: Record<string, string>;
  position: Vector3;
}

export interface FacilityMesh {
  mesh: Mesh;
  info: FacilityInfo;
}

export type TimeOfDay = "day" | "night";

export interface SceneState {
  timeOfDay: TimeOfDay;
  selectedFacility: FacilityInfo | null;
  isPointerLocked: boolean;
}
