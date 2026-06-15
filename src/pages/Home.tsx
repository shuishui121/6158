import BabylonScene from "@/components/BabylonScene";

export default function Home() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-900">
      <div className="w-full h-full relative">
        <BabylonScene />
      </div>
    </div>
  );
}