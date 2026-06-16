import { useEffect, useRef, useState, useCallback } from "react";
import { SceneManager } from "@/scene/SceneManager";
import type { FacilityInfo, TimeOfDay } from "@/scene/types";
import FacilityInfoPanel from "./FacilityInfoPanel";
import ControlPanel from "./ControlPanel";
import LoadingScreen from "./LoadingScreen";

export default function BabylonScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress] = useState(100);
  const [selectedFacility, setSelectedFacility] = useState<FacilityInfo | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("day");
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [spectatorCount, setSpectatorCount] = useState(30);
  const [maxSpectatorCount, setMaxSpectatorCount] = useState(50);
  const [spectatorsVisible, setSpectatorsVisible] = useState(true);

  const handleTimeOfDayChange = useCallback((time: TimeOfDay) => {
    setTimeOfDay(time);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setTimeOfDay(time);
      setMaxSpectatorCount(sceneManagerRef.current.getMaxSpectatorCount());
      setSpectatorCount(sceneManagerRef.current.getSpectatorCount());
    }
  }, []);

  const handleStartRoaming = useCallback(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.startRoaming();
    }
  }, []);

  const handleResetPosition = useCallback(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.resetPosition();
    }
  }, []);

  const handleTeleportToHighJump = useCallback(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.teleportToHighJump();
    }
  }, []);

  const handleCloseFacilityInfo = useCallback(() => {
    setSelectedFacility(null);
  }, []);

  const handleSpectatorCountChange = useCallback((count: number) => {
    setSpectatorCount(count);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setSpectatorCount(count);
    }
  }, []);

  const handleSpectatorsVisibleChange = useCallback((visible: boolean) => {
    setSpectatorsVisible(visible);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setSpectatorsVisible(visible);
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const manager = new SceneManager(canvas);
    sceneManagerRef.current = manager;

    manager.setOnFacilitySelect((info) => {
      setSelectedFacility(info);
    });

    manager.setOnPointerLockChange((locked) => {
      setIsPointerLocked(locked);
    });

    setIsLoading(false);

    return () => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose();
        sceneManagerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ outline: "none" }}
      />

      <LoadingScreen isLoading={isLoading} progress={loadProgress} />

      {!isLoading && (
        <>
          <ControlPanel
            timeOfDay={timeOfDay}
            onTimeOfDayChange={handleTimeOfDayChange}
            isPointerLocked={isPointerLocked}
            onStartRoaming={handleStartRoaming}
            onResetPosition={handleResetPosition}
            onTeleportToHighJump={handleTeleportToHighJump}
            spectatorCount={spectatorCount}
            maxSpectatorCount={maxSpectatorCount}
            onSpectatorCountChange={handleSpectatorCountChange}
            spectatorsVisible={spectatorsVisible}
            onSpectatorsVisibleChange={handleSpectatorsVisibleChange}
          />

          <FacilityInfoPanel
            facility={selectedFacility}
            onClose={handleCloseFacilityInfo}
          />

          {isPointerLocked && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
              <div className="w-2 h-2 border-2 border-white/70 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/50 -mt-2" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-0.5 bg-white/50 -ml-2" />
            </div>
          )}

          {isPointerLocked && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full z-10">
              按 ESC 退出漫游 · 点击设施查看详情
            </div>
          )}
        </>
      )}

      {!isLoading && !isPointerLocked && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl px-6 py-3 text-center">
            <p className="text-sm text-gray-600">
              点击{" "}
              <span className="font-semibold text-blue-600">「开始漫游」</span>
              按钮或直接点击场景
              <br />
              以第一人称视角探索田径馆
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
