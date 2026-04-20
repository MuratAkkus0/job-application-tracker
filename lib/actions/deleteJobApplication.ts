"use server";

import { getSession } from "@/lib/auth/auth";
import { JobApplication } from "@/lib/models";
import { shiftJobsUp } from "@/lib/services";
import { getOldPosition } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function deleteJobApplication(id: string) {
  const session = await getSession();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

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
    console.log("other jobs in column : ", otherJobsInColumn);
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

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Job application deleted successfully",
      data: JSON.parse(JSON.stringify(deletedJob)),
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to delete job application .",
    };
  }
}
