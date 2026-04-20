import { JobApplication } from "../models";
import { type JobApplication as JobApplicationType } from "../models/models.types";

export async function shiftJobsUp(
  jobsToShiftUp: JobApplicationType[],
  step: number = 100,
  floor: number = 100,
) {
  for (const job of jobsToShiftUp) {
    await JobApplication.findByIdAndUpdate(job._id, {
      $set: { order: Math.max(floor, job.order - step) },
    });
  }
}

export async function shiftJobsDown(
  jobsToShiftDown: JobApplicationType[],
  step: number = 100,
) {
  for (const job of jobsToShiftDown) {
    await JobApplication.findByIdAndUpdate(job._id, {
      $set: { order: job.order + step },
    });
  }
}
