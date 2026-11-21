import Link from "next/link";

export default function LabNextPage() {
  return (
    <main className="bg-paper p-6 text-ink">
      <h1>Lab next step</h1>
      <Link href="/lab">Back to lab</Link>
    </main>
  );
}
