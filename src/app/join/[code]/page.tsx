import { GroupGame } from "@/components/GroupGame";
import { normalizeCode } from "@/lib/codes";

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
      <GroupGame code={normalizeCode(code)} />
    </main>
  );
}
