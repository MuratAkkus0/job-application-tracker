"use client";

import { useEffect, useState } from "react";
import { Board, Column, JobApplication } from "../models/models.types";
import { updateJobApplication } from "@/lib/actions";

export function useBoard(initialBoard?: Board | null) {
  const [board, setBoard] = useState<Board | null>(initialBoard || null);
  const [columns, setColumns] = useState<Column[]>(initialBoard?.columns || []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBoard) {
      setBoard(initialBoard);
      setColumns(initialBoard.columns || []);
    }
  }, [initialBoard]);

  async function moveJob(
    jobApplicationId: string,
    newColumnId: string,
    targetIndex: number,
  ) {
    setColumns((prev) => {
      const newColumns = prev.map((col) => ({
        ...col,
        jobApplications: [...col.jobApplications],
      }));

      // Find and remove job from its current column
      let jobToMove: JobApplication | null = null;
      let oldColumnId: string | null = null;

      for (const col of newColumns) {
        const jobIndex = col.jobApplications.findIndex(
          (j) => j._id === jobApplicationId,
        );
        if (jobIndex !== -1) {
          jobToMove = col.jobApplications[jobIndex];
          oldColumnId = col._id;
          col.jobApplications.splice(jobIndex, 1);
          break;
        }
      }

      if (!jobToMove || !oldColumnId) return prev;

      // Find target column and insert at targetIndex
      const targetColumnIndex = newColumns.findIndex(
        (col) => col._id === newColumnId,
      );

      if (targetColumnIndex === -1) return prev;

      const targetColumn = newColumns[targetColumnIndex];
      const sortedJobs = [...targetColumn.jobApplications].sort(
        (a, b) => a.order - b.order,
      );

      const insertIndex = Math.min(targetIndex, sortedJobs.length);
      sortedJobs.splice(insertIndex, 0, {
        ...jobToMove,
        columnId: newColumnId,
      });

      // Renormalize target column: 100, 200, 300, …
      newColumns[targetColumnIndex] = {
        ...targetColumn,
        jobApplications: sortedJobs.map((job, idx) => ({
          ...job,
          order: (idx + 1) * 100,
        })),
      };

      // Renormalize source column too when moving across columns
      if (oldColumnId !== newColumnId) {
        const sourceColumnIndex = newColumns.findIndex(
          (col) => col._id === oldColumnId,
        );
        if (sourceColumnIndex !== -1) {
          const sourceColumn = newColumns[sourceColumnIndex];
          newColumns[sourceColumnIndex] = {
            ...sourceColumn,
            jobApplications: [...sourceColumn.jobApplications]
              .sort((a, b) => a.order - b.order)
              .map((job, idx) => ({ ...job, order: (idx + 1) * 100 })),
          };
        }
      }

      return newColumns;
    });

    try {
      await updateJobApplication(jobApplicationId, {
        columnId: newColumnId,
        targetIndex,
      });
    } catch (err) {
      console.error("Error moving job:", err);
    }
  }

  return { board, columns, error, moveJob };
}

export default useBoard;
