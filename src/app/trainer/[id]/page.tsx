import { TrainerLive } from "@/components/trainer/TrainerLive";

export default async function TrainerSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[1200px] flex-col">
      <TrainerLive sessionId={id} />
    </main>
  );
}
