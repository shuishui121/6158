import {
  Scene,
  Vector3,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
  SolidParticleSystem,
  Observer,
} from "@babylonjs/core";
import type { SpectatorData, SpectatorState, TimeOfDay } from "./types";

const COLOR_PALETTE = [
  new Color4(0.85, 0.3, 0.3, 1),
  new Color4(0.3, 0.55, 0.85, 1),
  new Color4(0.9, 0.75, 0.25, 1),
  new Color4(0.3, 0.75, 0.4, 1),
  new Color4(0.65, 0.35, 0.75, 1),
];

const MAX_SPECTATORS_DAY = 50;
const MAX_SPECTATORS_NIGHT = 20;

interface ForbiddenZone {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export class SpectatorManager {
  private scene: Scene;
  private spectators: SpectatorData[] = [];
  private sps: SolidParticleSystem | null = null;
  private spsMesh: Mesh | null = null;
  private baseMesh: Mesh | null = null;
  private spectatorCount: number = 0;
  private visible: boolean = true;
  private timeOfDay: TimeOfDay = "day";
  private cameraPosition: Vector3 = new Vector3(0, 1.7, 25);
  private spectatorZones: { minX: number; maxX: number; minZ: number; maxZ: number }[] = [];
  private forbiddenZones: ForbiddenZone[] = [];
  private isDisposed: boolean = false;
  private updateObserver: Observer<Scene> | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
    this.setupZones();
    this.createBaseMesh();
    this.registerUpdate();
  }

  private setupZones(): void {
    this.spectatorZones = [
      { minX: -35, maxX: 35, minZ: -28, maxZ: -18 },
      { minX: -35, maxX: 35, minZ: 18, maxZ: 28 },
    ];

    this.forbiddenZones = [
      { minX: -25, maxX: 25, minZ: -25, maxZ: 25 },
      { minX: 11, maxX: 19, minZ: -18, maxZ: 9 },
    ];
  }

  private createBaseMesh(): void {
    const bodyHeight = 1.2;
    const bodyRadius = 0.2;
    const headRadius = 0.2;

    const body = MeshBuilder.CreateCapsule(
      "spectator_body",
      {
        height: bodyHeight,
        radius: bodyRadius,
        tessellation: 6,
        subdivisions: 1,
      },
      this.scene
    );
    body.position.y = bodyHeight / 2;
    body.isVisible = false;

    const head = MeshBuilder.CreateSphere(
      "spectator_head",
      { diameter: headRadius * 2, segments: 8 },
      this.scene
    );
    head.position.y = bodyHeight + headRadius * 0.6;
    head.isVisible = false;

    const merged = Mesh.MergeMeshes(
      [body, head],
      true,
      true,
      undefined,
      false,
      true
    );

    if (merged) {
      merged.name = "spectator_base";
      merged.isVisible = false;
      this.baseMesh = merged;
    }
  }

  private createSPS(count: number): void {
    this.disposeSPS();

    if (count <= 0 || !this.baseMesh) return;

    this.sps = new SolidParticleSystem("spectatorsSPS", this.scene, {
      updatable: true,
    });

    this.sps.addShape(this.baseMesh, count);

    const mesh = this.sps.buildMesh();
    mesh.isPickable = false;
    mesh.isVisible = this.visible;
    this.spsMesh = mesh;

    const mat = new StandardMaterial("spectatorsMat", this.scene);
    mat.diffuseColor = new Color3(0.8, 0.8, 0.8);
    mat.specularColor = new Color3(0.1, 0.1, 0.1);
    mesh.material = mat;

    this.sps.initParticles();
    this.initParticleColors();
  }

  private initParticleColors(): void {
    if (!this.sps || !this.sps.mesh) return;

    const mesh = this.sps.mesh;
    const positions = mesh.getVerticesData("position");
    if (!positions) return;

    const vertexCount = positions.length / 3;
    const colors: number[] = [];
    for (let i = 0; i < vertexCount; i++) {
      colors.push(1, 1, 1, 1);
    }
    mesh.setVerticesData("color", colors);
  }

  private disposeSPS(): void {
    if (this.spsMesh) {
      this.spsMesh.dispose();
      this.spsMesh = null;
    }
    if (this.sps) {
      this.sps.dispose();
      this.sps = null;
    }
  }

  private getRandomPositionInZone(): Vector3 {
    const zone = this.spectatorZones[Math.floor(Math.random() * this.spectatorZones.length)];
    let x: number, z: number;
    let attempts = 0;

    do {
      x = zone.minX + Math.random() * (zone.maxX - zone.minX);
      z = zone.minZ + Math.random() * (zone.maxZ - zone.minZ);
      attempts++;
    } while (this.isInForbiddenZone(x, z) && attempts < 20);

    return new Vector3(x, 0, z);
  }

  private isInForbiddenZone(x: number, z: number): boolean {
    for (const zone of this.forbiddenZones) {
      if (x >= zone.minX && x <= zone.maxX && z >= zone.minZ && z <= zone.maxZ) {
        return true;
      }
    }
    return false;
  }

  private isPositionValid(x: number, z: number, margin: number = 0.5): boolean {
    if (this.isInForbiddenZone(x, z)) return false;

    let inAnyZone = false;
    for (const zone of this.spectatorZones) {
      if (
        x >= zone.minX + margin &&
        x <= zone.maxX - margin &&
        z >= zone.minZ + margin &&
        z <= zone.maxZ - margin
      ) {
        inAnyZone = true;
        break;
      }
    }
    return inAnyZone;
  }

  private generateSpectator(id: number): SpectatorData {
    const position = this.getRandomPositionInZone();
    return {
      id,
      position,
      targetPosition: position.clone(),
      state: "idle",
      stateTimer: 0,
      nextStateTime: 1 + Math.random() * 2,
      rotation: Math.random() * Math.PI * 2,
      colorIndex: Math.floor(Math.random() * COLOR_PALETTE.length),
      walkSpeed: 1.5 + Math.random() * 1.5,
      avoidanceOffset: new Vector3(0, 0, 0),
      talkingPartnerId: null,
    };
  }

  setCount(count: number): void {
    const maxCount = this.getMaxCount();
    const targetCount = Math.min(Math.max(0, Math.floor(count)), maxCount);

    if (targetCount === this.spectatorCount) return;

    this.spectators = [];
    for (let i = 0; i < targetCount; i++) {
      this.spectators.push(this.generateSpectator(i));
    }

    this.createSPS(targetCount);
    this.spectatorCount = targetCount;
    this.refreshParticles();
  }

  getCount(): number {
    return this.spectatorCount;
  }

  getMaxCount(): number {
    return this.timeOfDay === "day" ? MAX_SPECTATORS_DAY : MAX_SPECTATORS_NIGHT;
  }

  setTimeOfDay(time: TimeOfDay): void {
    this.timeOfDay = time;
    const maxCount = this.getMaxCount();
    if (this.spectatorCount > maxCount) {
      this.setCount(maxCount);
    }
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (this.spsMesh) {
      this.spsMesh.isVisible = visible;
    }
  }

  isVisible(): boolean {
    return this.visible;
  }

  setCameraPosition(position: Vector3): void {
    this.cameraPosition = position.clone();
  }

  private registerUpdate(): void {
    this.updateObserver = this.scene.onBeforeRenderObservable.add(() => {
      if (!this.isDisposed && this.visible && this.spectatorCount > 0 && this.sps) {
        const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
        this.update(deltaTime);
      }
    });
  }

  private update(deltaTime: number): void {
    for (let i = 0; i < this.spectators.length; i++) {
      this.updateSpectatorState(this.spectators[i], deltaTime);
      this.updateSpectatorAvoidance(this.spectators[i], deltaTime);
    }
    this.refreshParticles();
  }

  private updateSpectatorState(spectator: SpectatorData, deltaTime: number): void {
    spectator.stateTimer += deltaTime;

    if (spectator.stateTimer >= spectator.nextStateTime) {
      this.switchState(spectator);
      spectator.stateTimer = 0;
      spectator.nextStateTime = 1 + Math.random() * 2;
    }

    switch (spectator.state) {
      case "walking":
        this.updateWalking(spectator, deltaTime);
        break;
      case "idle":
        this.updateIdle(spectator, deltaTime);
        break;
      case "takingPhoto":
        this.updateTakingPhoto(spectator, deltaTime);
        break;
      case "talking":
        this.updateTalking(spectator, deltaTime);
        break;
    }
  }

  private switchState(spectator: SpectatorData): void {
    const states: SpectatorState[] = ["idle", "walking", "takingPhoto", "talking"];
    const weights = [0.3, 0.4, 0.15, 0.15];

    const random = Math.random();
    let newState: SpectatorState = "idle";
    let cumulative = 0;
    for (let i = 0; i < states.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        newState = states[i];
        break;
      }
    }

    if (spectator.state === "talking" && spectator.talkingPartnerId !== null) {
      const partner = this.spectators.find((s) => s.id === spectator.talkingPartnerId);
      if (partner) {
        partner.talkingPartnerId = null;
        partner.state = "idle";
        partner.nextStateTime = 1 + Math.random() * 2;
      }
      spectator.talkingPartnerId = null;
    }

    spectator.state = newState;

    if (newState === "walking") {
      this.setNewWalkTarget(spectator);
    } else if (newState === "takingPhoto") {
      spectator.rotation = Math.atan2(0 - spectator.position.x, -5 - spectator.position.z);
    } else if (newState === "talking") {
      this.findTalkingPartner(spectator);
    }
  }

  private setNewWalkTarget(spectator: SpectatorData): void {
    let attempts = 0;
    while (attempts < 10) {
      const zone = this.spectatorZones[Math.floor(Math.random() * this.spectatorZones.length)];
      const targetX = zone.minX + Math.random() * (zone.maxX - zone.minX);
      const targetZ = zone.minZ + Math.random() * (zone.maxZ - zone.minZ);

      if (this.isPositionValid(targetX, targetZ, 1)) {
        spectator.targetPosition = new Vector3(targetX, 0, targetZ);
        return;
      }
      attempts++;
    }
    spectator.targetPosition = spectator.position.clone();
  }

  private findTalkingPartner(spectator: SpectatorData): void {
    const nearby = this.spectators.filter(
      (s) =>
        s.id !== spectator.id &&
        s.state === "idle" &&
        Vector3.Distance(s.position, spectator.position) < 4
    );

    if (nearby.length > 0) {
      const partner = nearby[Math.floor(Math.random() * nearby.length)];
      spectator.talkingPartnerId = partner.id;
      partner.talkingPartnerId = spectator.id;
      partner.state = "talking";
      partner.nextStateTime = spectator.nextStateTime;
      partner.stateTimer = 0;

      const dir = partner.position.subtract(spectator.position);
      spectator.rotation = Math.atan2(dir.x, dir.z);
      partner.rotation = Math.atan2(-dir.x, -dir.z);
    } else {
      spectator.state = "idle";
    }
  }

  private updateWalking(spectator: SpectatorData, deltaTime: number): void {
    const direction = spectator.targetPosition.subtract(spectator.position);
    direction.y = 0;
    const distance = direction.length();

    if (distance < 0.2) {
      spectator.position = spectator.targetPosition.clone();
      return;
    }

    direction.normalize();
    const moveDistance = spectator.walkSpeed * deltaTime;
    const newPos = spectator.position.add(direction.scale(Math.min(moveDistance, distance)));

    if (this.isPositionValid(newPos.x, newPos.z, 0.3)) {
      spectator.position = newPos;
      spectator.rotation = Math.atan2(direction.x, direction.z);
    } else {
      this.setNewWalkTarget(spectator);
    }
  }

  private updateIdle(spectator: SpectatorData, deltaTime: number): void {
    if (Math.random() < deltaTime * 0.3) {
      spectator.rotation += (Math.random() - 0.5) * Math.PI * 0.3;
    }
  }

  private updateTakingPhoto(spectator: SpectatorData, deltaTime: number): void {
    spectator.rotation += Math.sin(spectator.stateTimer * 3) * 0.005 * deltaTime * 60;
  }

  private updateTalking(spectator: SpectatorData, deltaTime: number): void {
    if (spectator.talkingPartnerId !== null) {
      const partner = this.spectators.find((s) => s.id === spectator.talkingPartnerId);
      if (partner) {
        const dir = partner.position.subtract(spectator.position);
        const targetRot = Math.atan2(dir.x, dir.z);
        const diff = targetRot - spectator.rotation;
        spectator.rotation += diff * deltaTime * 3;
      }
    }
  }

  private updateSpectatorAvoidance(spectator: SpectatorData, deltaTime: number): void {
    const toCamera = this.cameraPosition.subtract(spectator.position);
    toCamera.y = 0;
    const distance = toCamera.length();

    const avoidRadius = 3;
    const avoidStrength = 2;

    if (distance < avoidRadius && distance > 0.1) {
      const avoidDir = toCamera.normalize().scale(-1);
      const strength = (1 - distance / avoidRadius) * avoidStrength;
      spectator.avoidanceOffset = avoidDir.scale(strength);
    } else {
      spectator.avoidanceOffset.scaleInPlace(Math.max(0, 1 - deltaTime * 3));
    }
  }

  private refreshParticles(): void {
    if (!this.sps || !this.sps.mesh || this.spectators.length === 0) return;

    for (let i = 0; i < this.spectators.length; i++) {
      const spectator = this.spectators[i];
      const particle = this.sps.particles[i];
      if (!particle) continue;

      const pos = spectator.position.add(spectator.avoidanceOffset);
      particle.position = pos;

      particle.rotation.y = spectator.rotation;

      let scaleY = 1;
      if (spectator.state === "takingPhoto") {
        scaleY = 1 + Math.sin(spectator.stateTimer * 4) * 0.02;
      } else if (spectator.state === "talking") {
        scaleY = 1 + Math.sin(spectator.stateTimer * 3) * 0.01;
      }
      particle.scale.y = scaleY;

      particle.color = COLOR_PALETTE[spectator.colorIndex];
    }

    this.sps.setParticles();
  }

  dispose(): void {
    this.isDisposed = true;
    if (this.updateObserver) {
      this.scene.onBeforeRenderObservable.remove(this.updateObserver);
      this.updateObserver = null;
    }
    this.disposeSPS();
    if (this.baseMesh) {
      this.baseMesh.dispose();
      this.baseMesh = null;
    }
    this.spectators = [];
  }
}
