"use server";

import { updateTag } from "next/cache";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { getBoardCacheTag } from "@/lib/cache";
import { Column, JobApplication } from "@/lib/models";
import { formatJobTags } from "@/lib/utils";
import {
  flattenFieldErrors,
  updateJobApplicationSchema,
  type UpdateJobApplicationInput,
} from "@/lib/validations/jobApplication";

export async function updateJobApplication(
  id: string,
  updates: UpdateJobApplicationInput,
) {
  const session = await getSession();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const parsed = updateJobApplicationSchema.safeParse(updates);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields",
      fieldErrors: flattenFieldErrors(parsed.error),
    };
  }

  try {
    await connectDB();

    const jobApplication = await JobApplication.findById(id);

    if (!jobApplication) {
      return { error: "Job application not found" };
    }

    if (jobApplication.userId !== session.user.id) {
      return { error: "Unauthorized" };
    }

    const { columnId, targetIndex, ...otherUpdates } = parsed.data;

    const updatesToApply: Partial<{
      company: string;
      position: string;
      location: string;
      notes: string;
      salary: string;
      jobUrl: string;
      columnId: string;
      order: number;
      tags: string[];
      description: string;
    }> = { ...otherUpdates, tags: formatJobTags(otherUpdates.tags) };

    const currentColumnId = jobApplication.columnId;
    const newColumnId = columnId;

    const isMovingToDifferentColumn =
      newColumnId && newColumnId !== currentColumnId;

    if (isMovingToDifferentColumn) {
      await Column.findByIdAndUpdate(currentColumnId, {
        $pull: { jobApplications: id },
      });

      const jobsInTarget = await JobApplication.find({
        columnId: newColumnId,
        _id: { $ne: id },
      })
        .sort({ order: 1 })
        .lean();

      const insertIndex =
        targetIndex !== undefined
          ? Math.min(targetIndex, jobsInTarget.length)
          : jobsInTarget.length;

      const movedJobNewOrder = (insertIndex + 1) * 100;

      await Promise.all(
        jobsInTarget.map((job, idx) => {
          const newOrder =
            idx < insertIndex ? (idx + 1) * 100 : (idx + 2) * 100;
          return JobApplication.findByIdAndUpdate(job._id, {
            $set: { order: newOrder },
          });
        }),
      );

      updatesToApply.columnId = newColumnId;
      updatesToApply.order = movedJobNewOrder;

      await Column.findByIdAndUpdate(newColumnId, {
        $push: { jobApplications: id },
      });

      const jobsInSource = await JobApplication.find({
        columnId: currentColumnId,
      })
        .sort({ order: 1 })
        .lean();

      await Promise.all(
        jobsInSource.map((job, idx) =>
          JobApplication.findByIdAndUpdate(job._id, {
            $set: { order: (idx + 1) * 100 },
          }),
        ),
      );
    } else if (targetIndex !== undefined) {
      const otherJobsInColumn = await JobApplication.find({
        columnId: currentColumnId,
        _id: { $ne: id },
      })
        .sort({ order: 1 })
        .lean();

      const insertIndex = Math.min(targetIndex, otherJobsInColumn.length);
      const movedJobNewOrder = (insertIndex + 1) * 100;

      await Promise.all(
        otherJobsInColumn.map((job, idx) => {
          const newOrder =
            idx < insertIndex ? (idx + 1) * 100 : (idx + 2) * 100;
          return JobApplication.findByIdAndUpdate(job._id, {
            $set: { order: newOrder },
          });
        }),
      );

      updatesToApply.order = movedJobNewOrder;
    }

    const updated = await JobApplication.findByIdAndUpdate(
      id,
      updatesToApply,
      {
        returnDocument: "after",
      },
    );

    updateTag(getBoardCacheTag(session.user.id));

    return {
      success: true,
      message: "Job application updated successfully",
      data: JSON.parse(JSON.stringify(updated)),
    };
  } catch (err: unknown) {
    console.error((err as Error)?.message);
    return { success: false, message: "Failed to update job application" };
  }
}
