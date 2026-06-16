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

export type SpectatorState = "idle" | "walking" | "takingPhoto" | "talking";

export interface SpectatorData {
  id: number;
  position: Vector3;
  targetPosition: Vector3;
  state: SpectatorState;
  stateTimer: number;
  nextStateTime: number;
  rotation: number;
  colorIndex: number;
  walkSpeed: number;
  avoidanceOffset: Vector3;
  talkingPartnerId: number | null;
}
