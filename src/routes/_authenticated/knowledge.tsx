import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/knowledge")({
  component: KnowledgePage,
});

function KnowledgePage() {
  return (
    <div
      className='min-h-screen bg-gradient-to-br from-zinc-800 to-black p-4'
      style={{
        backgroundImage:
          "radial-gradient(50% 50% at 20% 60%, #23272a 0%, #18181b 50%, #000000 100%)",
      }}
    >
      <div className='max-w-4xl mx-auto space-y-4'>HI</div>
    </div>
  );
}
