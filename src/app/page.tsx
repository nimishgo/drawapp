import dynamic from "next/dynamic";

const Canvas = dynamic(() => import("../components/Canvas"), { ssr: false });
const Toolbar = dynamic(() => import("../components/Toolbar"), { ssr: false });

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Drawing Board</h1>
      <Toolbar />
      <Canvas />
    </div>
  );
}
