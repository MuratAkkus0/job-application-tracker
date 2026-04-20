/**
 *
 * This function returns the current position index of the current job application
 *@param currentOrder The current job application's order.
 *@param otherJobsInColumn The array of other jobs in the column - an array without
 * current job application has to be provided
 * **/

import { JobApplication } from "@/lib/models/models.types";

export function getOldPosition(
  currentJobOrder: number,
  otherJobsInColumn: JobApplication[],
) {
  const currentPositionIndex = otherJobsInColumn.findIndex(
    (job) => job.order > currentJobOrder,
  );
  const oldPositionIndex =
    currentPositionIndex === -1
      ? otherJobsInColumn.length
      : currentPositionIndex;

  return oldPositionIndex;
}
