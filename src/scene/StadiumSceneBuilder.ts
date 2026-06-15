import {
  Scene,
  Vector3,
  Color3,
  Color4,
  MeshBuilder,
  StandardMaterial,
  DirectionalLight,
  HemisphericLight,
  PointLight,
  ShadowGenerator,
  GroundMesh,
  Mesh,
  Animation,
  CubicEase,
  EasingFunction,
} from "@babylonjs/core";
import type { FacilityInfo, FacilityMesh, TimeOfDay } from "./types";

export class StadiumSceneBuilder {
  private scene: Scene;
  private facilities: FacilityMesh[] = [];
  private dayLights: { hemi: HemisphericLight; dir: DirectionalLight } | null = null;
  private nightLights: PointLight[] = [];
  private ground: GroundMesh | null = null;
  private stadiumWalls: Mesh[] = [];

  constructor(scene: Scene) {
    this.scene = scene;
  }

  build(): FacilityMesh[] {
    this.createGround();
    this.createStadium();
    this.createHighJumpArea();
    this.createAmbientDecorations();
    this.setupLighting();
    this.setTimeOfDay("day");
    return this.facilities;
  }

  private createGround(): void {
    this.ground = MeshBuilder.CreateGround("ground", { width: 80, height: 60 }, this.scene);
    const groundMat = new StandardMaterial("groundMat", this.scene);
    groundMat.diffuseColor = new Color3(0.45, 0.55, 0.35);
    groundMat.specularColor = new Color3(0.1, 0.1, 0.1);
    groundMat.backFaceCulling = false;
    this.ground.material = groundMat;
    this.ground.receiveShadows = true;

    const trackMat = new StandardMaterial("trackMat", this.scene);
    trackMat.diffuseColor = new Color3(0.8, 0.55, 0.25);
    trackMat.specularColor = new Color3(0.2, 0.2, 0.2);

    for (let i = 0; i < 8; i++) {
      const track = MeshBuilder.CreateGround(
        `track_${i}`,
        { width: 1.22, height: 50 },
        this.scene
      );
      track.position = new Vector3(-20 + i * 1.22, 0.01, 0);
      track.material = trackMat;
      track.receiveShadows = true;
    }

    const infield = MeshBuilder.CreateGround("infield", { width: 30, height: 45 }, this.scene);
    infield.position = new Vector3(0, 0.015, 0);
    const infieldMat = new StandardMaterial("infieldMat", this.scene);
    infieldMat.diffuseColor = new Color3(0.35, 0.5, 0.25);
    infield.material = infieldMat;
    infield.receiveShadows = true;
  }

  private createStadium(): void {
    const wallMat = new StandardMaterial("wallMat", this.scene);
    wallMat.diffuseColor = new Color3(0.75, 0.75, 0.78);
    wallMat.specularColor = new Color3(0.3, 0.3, 0.3);
    wallMat.backFaceCulling = false;

    const backWall = MeshBuilder.CreateBox(
      "backWall",
      { width: 82, height: 12, depth: 1 },
      this.scene
    );
    backWall.position = new Vector3(0, 6, -30.5);
    backWall.material = wallMat;
    backWall.receiveShadows = true;
    this.stadiumWalls.push(backWall);

    const frontWall = MeshBuilder.CreateBox(
      "frontWall",
      { width: 82, height: 12, depth: 1 },
      this.scene
    );
    frontWall.position = new Vector3(0, 6, 30.5);
    frontWall.material = wallMat;
    frontWall.receiveShadows = true;
    this.stadiumWalls.push(frontWall);

    const leftWall = MeshBuilder.CreateBox(
      "leftWall",
      { width: 1, height: 12, depth: 60 },
      this.scene
    );
    leftWall.position = new Vector3(-40.5, 6, 0);
    leftWall.material = wallMat;
    leftWall.receiveShadows = true;
    this.stadiumWalls.push(leftWall);

    const rightWall = MeshBuilder.CreateBox(
      "rightWall",
      { width: 1, height: 12, depth: 60 },
      this.scene
    );
    rightWall.position = new Vector3(40.5, 6, 0);
    rightWall.material = wallMat;
    rightWall.receiveShadows = true;
    this.stadiumWalls.push(rightWall);

    const roof = MeshBuilder.CreateBox(
      "roof",
      { width: 84, height: 0.5, depth: 62 },
      this.scene
    );
    roof.position = new Vector3(0, 12.25, 0);
    const roofMat = new StandardMaterial("roofMat", this.scene);
    roofMat.diffuseColor = new Color3(0.6, 0.58, 0.55);
    roofMat.backFaceCulling = false;
    roof.material = roofMat;
    this.stadiumWalls.push(roof);

    const seatMat = new StandardMaterial("seatMat", this.scene);
    seatMat.diffuseColor = new Color3(0.3, 0.4, 0.6);

    for (let row = 0; row < 10; row++) {
      const seatRow = MeshBuilder.CreateBox(
        `seatRow_${row}`,
        { width: 70, height: 0.4, depth: 0.8 },
        this.scene
      );
      seatRow.position = new Vector3(0, row * 0.5 + 0.2, -26 + row * 0.9);
      seatRow.material = seatMat;
      seatRow.receiveShadows = true;
    }

    for (let row = 0; row < 10; row++) {
      const seatRow = MeshBuilder.CreateBox(
        `seatRow_front_${row}`,
        { width: 70, height: 0.4, depth: 0.8 },
        this.scene
      );
      seatRow.position = new Vector3(0, row * 0.5 + 0.2, 26 - row * 0.9);
      seatRow.material = seatMat;
      seatRow.receiveShadows = true;
    }
  }

  private createHighJumpArea(): void {
    const areaX = 15;
    const areaZ = -10;

    const runway = MeshBuilder.CreateGround(
      "highJumpRunway",
      { width: 4, height: 25 },
      this.scene
    );
    runway.position = new Vector3(areaX, 0.02, areaZ - 12);
    const runwayMat = new StandardMaterial("runwayMat", this.scene);
    runwayMat.diffuseColor = new Color3(0.9, 0.85, 0.7);
    runway.material = runwayMat;
    runway.receiveShadows = true;

    const runwayInfo: FacilityInfo = {
      id: "highjump-runway",
      name: "跳高助跑道",
      type: "跑道设施",
      description:
        "跳高助跑道为运动员提供加速助跑的通道。助跑长度根据运动员水平调整，通常为15-20米。跑道采用防滑合成材料，确保运动员在高速助跑时的稳定性。",
      specs: {
        长度: "25米",
        宽度: "4米",
        材质: "聚氨酯合成材料",
        厚度: "13毫米",
        摩擦系数: "≥0.6",
        颜色: "米黄色",
      },
      position: new Vector3(areaX, 0, areaZ - 12),
    };
    this.facilities.push({ mesh: runway as Mesh, info: runwayInfo });

    const takeoffBoard = MeshBuilder.CreateBox(
      "takeoffBoard",
      { width: 1.22, height: 0.1, depth: 0.2 },
      this.scene
    );
    takeoffBoard.position = new Vector3(areaX, 0.06, areaZ + 0.5);
    const takeoffMat = new StandardMaterial("takeoffMat", this.scene);
    takeoffMat.diffuseColor = new Color3(0.95, 0.8, 0.2);
    takeoffBoard.material = takeoffMat;

    const takeoffInfo: FacilityInfo = {
      id: "highjump-takeoff",
      name: "起跳区",
      type: "比赛设施",
      description:
        "起跳区是跳高运动员蹬地起跳的关键区域。起跳线采用醒目的黄色标识，运动员必须在起跳线前完成起跳动作。起跳区下方安装有压力传感系统，可精确检测起跳位置。",
      specs: {
        起跳板长度: "1.22米",
        起跳板宽度: "20厘米",
        起跳线宽度: "5厘米",
        材质: "硬质橡胶复合板",
        传感器精度: "±1毫米",
      },
      position: new Vector3(areaX, 0.1, areaZ + 0.5),
    };
    this.facilities.push({ mesh: takeoffBoard, info: takeoffInfo });

    const landingPitBase = MeshBuilder.CreateBox(
      "landingPitBase",
      { width: 6, height: 0.3, depth: 4 },
      this.scene
    );
    landingPitBase.position = new Vector3(areaX, 0.15, areaZ + 5);
    const pitBaseMat = new StandardMaterial("pitBaseMat", this.scene);
    pitBaseMat.diffuseColor = new Color3(0.4, 0.4, 0.45);
    landingPitBase.material = pitBaseMat;
    landingPitBase.receiveShadows = true;

    const landingMat = MeshBuilder.CreateBox(
      "landingMat",
      { width: 5, height: 0.7, depth: 3.5 },
      this.scene
    );
    landingMat.position = new Vector3(areaX, 0.65, areaZ + 5);
    const matMat = new StandardMaterial("matMat", this.scene);
    matMat.diffuseColor = new Color3(0.2, 0.6, 0.3);
    matMat.specularColor = new Color3(0.1, 0.1, 0.1);
    landingMat.material = matMat;

    const matInfo: FacilityInfo = {
      id: "highjump-mat",
      name: "跳高落地区（海绵垫）",
      type: "安全设施",
      description:
        "跳高落地区采用高密度泡沫海绵垫，为运动员提供安全的着陆保护。垫子整体厚度70厘米，由多层不同密度的海绵组合而成，确保运动员从任何高度落下都能获得充分缓冲。表面覆盖防滑耐磨合成革，便于清洁维护。",
      specs: {
        长度: "5米",
        宽度: "3.5米",
        厚度: "70厘米",
        表层材质: "PVC合成革",
        芯材材质: "高密度聚氨酯泡沫",
        密度分层: "三层梯度密度设计",
        承重: "≥150公斤",
        符合标准: "IAAF国际田联认证",
      },
      position: new Vector3(areaX, 0.7, areaZ + 5),
    };
    this.facilities.push({ mesh: landingMat, info: matInfo });

    const leftStandard = MeshBuilder.CreateCylinder(
      "leftStandard",
      { height: 5, diameter: 0.15 },
      this.scene
    );
    leftStandard.position = new Vector3(areaX - 2.5, 2.5, areaZ + 2.5);
    const standardMat = new StandardMaterial("standardMat", this.scene);
    standardMat.diffuseColor = new Color3(0.7, 0.7, 0.75);
    standardMat.specularColor = new Color3(0.8, 0.8, 0.8);
    leftStandard.material = standardMat;

    const rightStandard = MeshBuilder.CreateCylinder(
      "rightStandard",
      { height: 5, diameter: 0.15 },
      this.scene
    );
    rightStandard.position = new Vector3(areaX + 2.5, 2.5, areaZ + 2.5);
    rightStandard.material = standardMat;

    const standardInfo: FacilityInfo = {
      id: "highjump-standards",
      name: "跳高架立柱",
      type: "比赛设施",
      description:
        "跳高立柱采用高强度铝合金材料，高度可电动调节。立柱上配有精确刻度显示，最小调节单位为1毫米。立柱底部设有固定装置，确保在比赛中不会移动。横杆托座设计有自动脱落装置，当横杆受到轻微触碰时会自然脱落，避免影响运动员动作。",
      specs: {
        立柱高度: "5米",
        立柱间距: "4米",
        可调高度范围: "0.5米 - 2.5米",
        调节精度: "1毫米",
        材质: "航空级铝合金",
        表面处理: "阳极氧化哑光处理",
      },
      position: new Vector3(areaX, 2.5, areaZ + 2.5),
    };
    this.facilities.push({ mesh: leftStandard, info: standardInfo });
    this.facilities.push({ mesh: rightStandard, info: standardInfo });

    const crossbar = MeshBuilder.CreateCylinder(
      "crossbar",
      { height: 4.1, diameter: 0.04 },
      this.scene
    );
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position = new Vector3(areaX, 2.0, areaZ + 2.5);
    const barMat = new StandardMaterial("crossbarMat", this.scene);
    barMat.diffuseColor = new Color3(1.0, 0.9, 0.2);
    barMat.emissiveColor = new Color3(0.3, 0.25, 0.05);
    barMat.specularColor = new Color3(0.9, 0.9, 0.7);
    crossbar.material = barMat;

    const barInfo: FacilityInfo = {
      id: "highjump-crossbar",
      name: "跳高横杆",
      type: "比赛设施",
      description:
        "跳高横杆采用高强度玻璃纤维复合材料制成，重量轻且柔韧性好。横杆表面有清晰的红白相间刻度标记，便于裁判和观众观察高度。横杆设计为两端圆形，放置在立柱托座上时可自由转动，确保在被触碰时能顺利脱落，不会对运动员造成阻碍。",
      specs: {
        长度: "4.1米",
        直径: "40毫米",
        重量: "约1.5公斤",
        材质: "玻璃纤维增强塑料(FRP)",
        弯曲挠度: "≤10厘米（中部）",
        颜色: "亮黄色（配刻度标记）",
        符合标准: "IAAF认证标准",
      },
      position: new Vector3(areaX, 2.0, areaZ + 2.5),
    };
    this.facilities.push({ mesh: crossbar, info: barInfo });

    const areaSign = MeshBuilder.CreatePlane(
      "highJumpSign",
      { width: 3, height: 1.2 },
      this.scene
    );
    areaSign.position = new Vector3(areaX, 4, areaZ + 8);
    areaSign.billboardMode = Mesh.BILLBOARDMODE_ALL;
    const signMat = new StandardMaterial("signMat", this.scene);
    signMat.diffuseColor = new Color3(0.2, 0.4, 0.8);
    signMat.emissiveColor = new Color3(0.1, 0.2, 0.4);
    areaSign.material = signMat;

    this.createHeightMarkers(areaX, areaZ);
    this.addBounceAnimation(landingMat);
  }

  private createHeightMarkers(areaX: number, areaZ: number): void {
    const heights = [1.5, 1.8, 2.0, 2.2, 2.4];
    const markerMat = new StandardMaterial("markerMat", this.scene);
    markerMat.diffuseColor = new Color3(0.9, 0.2, 0.2);

    for (const h of heights) {
      const marker = MeshBuilder.CreateBox(
        `marker_${h}`,
        { width: 0.1, height: 0.02, depth: 0.1 },
        this.scene
      );
      marker.position = new Vector3(areaX - 2.7, h, areaZ + 2.5);
      marker.material = markerMat;
    }
  }

  private addBounceAnimation(mesh: Mesh): void {
    const animation = new Animation(
      "bounce",
      "position.y",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const keys = [
      { frame: 0, value: mesh.position.y },
      { frame: 30, value: mesh.position.y + 0.05 },
      { frame: 60, value: mesh.position.y },
    ];

    animation.setKeys(keys);

    const easing = new CubicEase();
    easing.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    animation.setEasingFunction(easing);

    mesh.animations = [animation];
    this.scene.beginAnimation(mesh, 0, 60, true);
  }

  private createAmbientDecorations(): void {
    const flagMat1 = new StandardMaterial("flagMat1", this.scene);
    flagMat1.diffuseColor = new Color3(0.9, 0.15, 0.15);

    const flagMat2 = new StandardMaterial("flagMat2", this.scene);
    flagMat2.diffuseColor = new Color3(0.15, 0.4, 0.9);

    for (let i = 0; i < 6; i++) {
      const pole = MeshBuilder.CreateCylinder(
        `flagPole_${i}`,
        { height: 8, diameter: 0.08 },
        this.scene
      );
      pole.position = new Vector3(-35 + i * 14, 4, -29.5);
      const poleMat = new StandardMaterial(`poleMat_${i}`, this.scene);
      poleMat.diffuseColor = new Color3(0.5, 0.5, 0.55);
      pole.material = poleMat;

      const flag = MeshBuilder.CreatePlane(
        `flag_${i}`,
        { width: 1.5, height: 1 },
        this.scene
      );
      flag.position = new Vector3(-35 + i * 14 + 0.8, 7.2, -29.5);
      flag.rotation.y = Math.PI / 2;
      flag.material = i % 2 === 0 ? flagMat1 : flagMat2;
    }
  }

  private setupLighting(): void {
    const hemiLight = new HemisphericLight(
      "hemiLight",
      new Vector3(0, 1, 0),
      this.scene
    );
    hemiLight.intensity = 0.8;
    hemiLight.diffuse = new Color3(1, 0.98, 0.95);
    hemiLight.groundColor = new Color3(0.5, 0.55, 0.5);

    const dirLight = new DirectionalLight(
      "dirLight",
      new Vector3(-1, -1.5, -0.5),
      this.scene
    );
    dirLight.position = new Vector3(20, 30, 20);
    dirLight.intensity = 1.0;

    const shadowGenerator = new ShadowGenerator(1024, dirLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    this.facilities.forEach((f) => {
      shadowGenerator.addShadowCaster(f.mesh);
    });

    if (this.ground) {
      this.ground.receiveShadows = true;
    }

    this.dayLights = { hemi: hemiLight, dir: dirLight };

    const lightPositions = [
      new Vector3(-20, 10, -20),
      new Vector3(20, 10, -20),
      new Vector3(-20, 10, 20),
      new Vector3(20, 10, 20),
      new Vector3(0, 11, 0),
    ];

    for (let i = 0; i < lightPositions.length; i++) {
      const pointLight = new PointLight(
        `nightLight_${i}`,
        lightPositions[i],
        this.scene
      );
      pointLight.intensity = 0;
      pointLight.diffuse = new Color3(1, 0.9, 0.7);
      pointLight.range = 50;
      this.nightLights.push(pointLight);
    }
  }

  setTimeOfDay(time: TimeOfDay): void {
    if (!this.dayLights) return;

    if (time === "day") {
      this.dayLights.hemi.intensity = 0.8;
      this.dayLights.dir.intensity = 1.0;
      this.nightLights.forEach((light) => {
        light.intensity = 0;
      });
      this.scene.clearColor = new Color4(0.75, 0.85, 0.95, 1);
      this.scene.ambientColor = new Color3(0.4, 0.45, 0.5);

      this.stadiumWalls.forEach((wall) => {
        const mat = wall.material as StandardMaterial;
        if (mat) {
          mat.emissiveColor = new Color3(0, 0, 0);
        }
      });
    } else {
      this.dayLights.hemi.intensity = 0.15;
      this.dayLights.dir.intensity = 0.2;
      this.nightLights.forEach((light) => {
        light.intensity = 1.2;
      });
      this.scene.clearColor = new Color4(0.05, 0.08, 0.15, 1);
      this.scene.ambientColor = new Color3(0.1, 0.12, 0.18);

      this.stadiumWalls.forEach((wall) => {
        const mat = wall.material as StandardMaterial;
        if (mat) {
          mat.emissiveColor = new Color3(0.02, 0.02, 0.03);
        }
      });
    }
  }
}
