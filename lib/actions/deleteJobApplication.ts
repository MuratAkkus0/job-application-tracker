"use server";

import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { getBoardCacheTag } from "@/lib/cache";
import { JobApplication } from "@/lib/models";
import { shiftJobsUp } from "@/lib/services";
import { getOldPosition } from "@/lib/utils";
import { updateTag } from "next/cache";
import { getPostHogClient } from "@/lib/posthog-server";

export async function deleteJobApplication(id: string) {
  const session = await getSession();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  await connectDB();

  const jobApplication = await JobApplication.findById(id);

  if (!jobApplication) {
    return { error: "Job application not found" };
  }

  if (jobApplication.userId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  try {
    const { _id, columnId } = jobApplication;

    if (!_id || !columnId) {
      throw Error("Job application id or columnId missing.");
    }
    const otherJobsInColumn = await JobApplication.find({
      columnId,
      _id: { $ne: id },
    })
      .sort({ order: 1 })
      .lean();

    if (otherJobsInColumn.length > 0) {
      const currentJobOrder = jobApplication.order || 100;
      const oldPositionIndex = getOldPosition(
        currentJobOrder,
        otherJobsInColumn,
      );

      const jobsToShiftUp = otherJobsInColumn.slice(oldPositionIndex);

      await shiftJobsUp(jobsToShiftUp);
    }

    const deletedJob = await JobApplication.findByIdAndDelete(_id).lean();

    updateTag(getBoardCacheTag(session.user.id));

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: session.user.id,
      event: "server_job_application_deleted",
      properties: {
        company: jobApplication.company,
        position: jobApplication.position,
      },
    });

    return {
      success: true,
      message: "Job application deleted successfully",
      data: JSON.parse(JSON.stringify(deletedJob)),
    };
  } catch (err: unknown) {
    console.error((err as Error)?.message);
    return {
      success: false,
      message: "Failed to delete job application.",
    };
  }
}
