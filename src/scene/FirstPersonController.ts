import {
  Scene,
  Vector3,
  PointerEventTypes,
  PointerInfo,
  AbstractMesh,
  FreeCamera,
} from "@babylonjs/core";
import type { FacilityInfo, FacilityMesh } from "./types";

export class FirstPersonController {
  private scene: Scene;
  private canvas: HTMLCanvasElement;
  private cameraPosition: Vector3;
  private cameraRotationX: number = 0;
  private cameraRotationY: number = 0;
  private speed: number = 15;
  private isPointerLocked: boolean = false;
  private keys: Record<string, boolean> = {};
  private facilities: FacilityMesh[] = [];
  private onFacilitySelect: ((info: FacilityInfo | null) => void) | null = null;
  private onPointerLockChange: ((locked: boolean) => void) | null = null;
  private readonly boundaryMin = new Vector3(-38, 1.6, -28);
  private readonly boundaryMax = new Vector3(38, 1.6, 28);

  constructor(scene: Scene, canvas: HTMLCanvasElement) {
    this.scene = scene;
    this.canvas = canvas;
    this.cameraPosition = new Vector3(0, 1.7, 20);

    this.setupControls();
  }

  setFacilities(facilities: FacilityMesh[]): void {
    this.facilities = facilities;
  }

  setOnFacilitySelect(callback: (info: FacilityInfo | null) => void): void {
    this.onFacilitySelect = callback;
  }

  setOnPointerLockChange(callback: (locked: boolean) => void): void {
    this.onPointerLockChange = callback;
  }

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  getPosition(): Vector3 {
    return this.cameraPosition.clone();
  }

  getIsPointerLocked(): boolean {
    return this.isPointerLocked;
  }

  requestPointerLock(): void {
    this.canvas.requestPointerLock();
  }

  exitPointerLock(): void {
    document.exitPointerLock();
  }

  private setupControls(): void {
    document.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
    });

    document.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    document.addEventListener("pointerlockchange", () => {
      this.isPointerLocked = document.pointerLockElement === this.canvas;
      this.onPointerLockChange?.(this.isPointerLocked);
    });

    this.scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === PointerEventTypes.POINTERMOVE && this.isPointerLocked) {
        const event = pointerInfo.event as MouseEvent;
        this.cameraRotationY -= event.movementX * 0.002;
        this.cameraRotationX -= event.movementY * 0.002;
        this.cameraRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.cameraRotationX));
      }
    });

    this.scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
        if (!this.isPointerLocked) {
          const pickResult = pointerInfo.pickInfo;
          if (pickResult && pickResult.hit && pickResult.pickedMesh) {
            const pickedMesh = pickResult.pickedMesh as AbstractMesh;
            let found = false;
            for (const facility of this.facilities) {
              if (this.isMeshOrDescendant(pickedMesh, facility.mesh)) {
                this.onFacilitySelect?.(facility.info);
                found = true;
                break;
              }
            }
            if (!found) {
              this.requestPointerLock();
            }
          } else {
            this.requestPointerLock();
          }
        } else {
          this.handleClick(pointerInfo);
        }
      }
    });

    this.scene.registerBeforeRender(() => {
      this.update();
    });
  }

  private handleClick(pointerInfo: PointerInfo): void {
    const pickResult = pointerInfo.pickInfo;
    if (!pickResult || !pickResult.hit || !pickResult.pickedMesh) {
      this.onFacilitySelect?.(null);
      return;
    }

    const pickedMesh = pickResult.pickedMesh as AbstractMesh;

    for (const facility of this.facilities) {
      if (this.isMeshOrDescendant(pickedMesh, facility.mesh)) {
        this.onFacilitySelect?.(facility.info);
        return;
      }
    }

    this.onFacilitySelect?.(null);
  }

  private isMeshOrDescendant(target: AbstractMesh, mesh: AbstractMesh): boolean {
    if (target === mesh) return true;
    for (const child of mesh.getChildMeshes()) {
      if (this.isMeshOrDescendant(target, child as AbstractMesh)) return true;
    }
    return false;
  }

  private update(): void {
    if (!this.isPointerLocked) return;

    const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
    const moveDistance = this.speed * deltaTime;

    const forward = new Vector3(
      -Math.sin(this.cameraRotationY),
      0,
      -Math.cos(this.cameraRotationY)
    );
    const right = new Vector3(
      -Math.cos(this.cameraRotationY),
      0,
      Math.sin(this.cameraRotationY)
    );

    const moveDir = new Vector3(0, 0, 0);

    if (this.keys["KeyW"] || this.keys["ArrowUp"]) {
      moveDir.addInPlace(forward);
    }
    if (this.keys["KeyS"] || this.keys["ArrowDown"]) {
      moveDir.subtractInPlace(forward);
    }
    if (this.keys["KeyD"] || this.keys["ArrowRight"]) {
      moveDir.addInPlace(right);
    }
    if (this.keys["KeyA"] || this.keys["ArrowLeft"]) {
      moveDir.subtractInPlace(right);
    }

    if (moveDir.length() > 0) {
      moveDir.normalize().scaleInPlace(moveDistance);
      const newPos = this.cameraPosition.add(moveDir);

      newPos.x = Math.max(this.boundaryMin.x, Math.min(this.boundaryMax.x, newPos.x));
      newPos.z = Math.max(this.boundaryMin.z, Math.min(this.boundaryMax.z, newPos.z));
      newPos.y = 1.7;

      this.cameraPosition = newPos;
    }

    this.updateCamera();
  }

  private updateCamera(): void {
    const camera = this.scene.activeCamera;
    if (!camera) return;

    camera.position = this.cameraPosition.clone();

    const lookDir = new Vector3(
      -Math.sin(this.cameraRotationY) * Math.cos(this.cameraRotationX),
      Math.sin(this.cameraRotationX),
      -Math.cos(this.cameraRotationY) * Math.cos(this.cameraRotationX)
    );

    (camera as FreeCamera).setTarget(this.cameraPosition.add(lookDir.scale(10)));
  }

  resetPosition(): void {
    this.cameraPosition = new Vector3(0, 3, 20);
    this.cameraRotationX = -0.15;
    this.cameraRotationY = 0;
    this.updateCamera();
  }

  teleportTo(position: Vector3, yaw: number = 0, pitch: number = 0): void {
    this.cameraPosition = position.clone();
    this.cameraRotationY = yaw;
    this.cameraRotationX = pitch;
    this.updateCamera();
  }
}
