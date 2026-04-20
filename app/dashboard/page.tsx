import KanbanBoard from "@/components/KanbanBoard";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board } from "@/lib/models";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";

async function getBoard(userId: string) {
  "use cache";
  await connectDB();

  const board = await Board.findOne({
    userId,
    name: "Job Hunt",
  }).populate({
    path: "columns",
    populate: { path: "jobApplications" },
  });

  if (!board) {
    return null;
  }
  return JSON.parse(JSON.stringify(board));
}

async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    return <></>;
  }
  const board = await getBoard(session.user.id);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black">Job Hunt</h1>
          <p className="text-gray-600">Track your job applications</p>
        </div>
        <KanbanBoard board={board} />
      </div>
    </div>
  );
}

export default async function Dashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardPage />
    </Suspense>
  );
}
