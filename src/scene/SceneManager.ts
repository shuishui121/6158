import {
  Engine,
  Scene,
  FreeCamera,
  Vector3,
  Color4,
} from "@babylonjs/core";
import { StadiumSceneBuilder } from "./StadiumSceneBuilder";
import { FirstPersonController } from "./FirstPersonController";
import type { FacilityInfo, FacilityMesh, TimeOfDay } from "./types";

export class SceneManager {
  private engine: Engine;
  private scene: Scene;
  private canvas: HTMLCanvasElement;
  private builder: StadiumSceneBuilder;
  private controller: FirstPersonController;
  private facilities: FacilityMesh[] = [];
  private onFacilitySelect: ((info: FacilityInfo | null) => void) | null = null;
  private onPointerLockChange: ((locked: boolean) => void) | null = null;
  private isDisposed: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
      alpha: false,
    });

    this.scene = new Scene(this.engine);

    (window as any)._debugScene = this.scene;
    (window as any)._debugEngine = this.engine;

    const camera = new FreeCamera(
      "camera",
      new Vector3(0, 1.7, 25),
      this.scene
    );
    camera.fov = 1.0;
    camera.minZ = 0.1;
    camera.maxZ = 500;
    camera.setTarget(new Vector3(0, 1.7, 0));

    this.builder = new StadiumSceneBuilder(this.scene);
    this.controller = new FirstPersonController(this.scene, this.canvas);

    this.initialize();
  }

  private initialize(): void {
    this.facilities = this.builder.build();
    this.controller.setFacilities(this.facilities);

    this.controller.setOnFacilitySelect((info) => {
      this.onFacilitySelect?.(info);
    });

    this.controller.setOnPointerLockChange((locked) => {
      this.onPointerLockChange?.(locked);
    });

    this.controller.teleportTo(new Vector3(0, 3, 20), 0, -0.15);

    this.engine.runRenderLoop(() => {
      if (!this.isDisposed) {
        this.scene.render();
      }
    });

    const handleResize = () => {
      if (!this.isDisposed) {
        this.engine.resize();
      }
    };
    window.addEventListener("resize", handleResize);
  }

  setOnFacilitySelect(callback: (info: FacilityInfo | null) => void): void {
    this.onFacilitySelect = callback;
  }

  setOnPointerLockChange(callback: (locked: boolean) => void): void {
    this.onPointerLockChange = callback;
  }

  setTimeOfDay(time: TimeOfDay): void {
    this.builder.setTimeOfDay(time);
  }

  startRoaming(): void {
    this.controller.requestPointerLock();
  }

  stopRoaming(): void {
    this.controller.exitPointerLock();
  }

  resetPosition(): void {
    this.controller.resetPosition();
  }

  teleportToHighJump(): void {
    this.controller.teleportTo(new Vector3(15, 2.5, 3), 0, -0.2);
  }

  getIsPointerLocked(): boolean {
    return this.controller.getIsPointerLocked();
  }

  getFacilities(): FacilityInfo[] {
    return this.facilities.map((f) => f.info);
  }

  dispose(): void {
    this.isDisposed = true;
    this.engine.stopRenderLoop();
    this.scene.dispose();
    this.engine.dispose();
  }
}
