"use server";

import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board, Column, JobApplication } from "@/lib/models";
import { formatJobTags } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getPostHogClient } from "@/lib/posthog-server";

interface JobApplicationData {
  company: string;
  position: string;
  location?: string;
  notes?: string;
  salary?: string;
  jobUrl?: string;
  columnId: string;
  boardId: string;
  tags?: string;
  description?: string;
}

export async function createJobApplication(data: JobApplicationData) {
  const session = await getSession();
  if (!session?.user) {
    return { success: false, message: "Unauthorized" };
  }

  const {
    company,
    position,
    location,
    notes,
    salary,
    jobUrl,
    columnId,
    boardId,
    tags,
    description,
  } = data;

  if (!company || !position || !columnId || !boardId) {
    return { success: false, message: "Missing required fields" };
  }

  try {
    await connectDB();

    const board = await Board.findOne({
      _id: boardId,
      userId: session.user.id,
    });
    if (!board) {
      return { success: false, message: "Board not found" };
    }

    const column = await Column.findOne({ _id: columnId, boardId });
    if (!column) {
      return { success: false, message: "Column not found" };
    }

    const lastOrder = await JobApplication.findOne({ columnId })
      .sort({
        order: -1,
      })
      .select("order")
      .lean<{ order: number } | null>();

    const jobApplication = await JobApplication.create({
      company,
      position,
      location,
      notes,
      salary,
      jobUrl,
      columnId,
      boardId,
      tags: formatJobTags(tags),
      description,
      userId: session.user.id,
      order: lastOrder ? lastOrder.order + 100 : 100,
      status: "applied",
    });

    await Column.findByIdAndUpdate(columnId, {
      $push: { jobApplications: jobApplication._id },
    });

    revalidatePath(`/dashboard`);

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: session.user.id,
      event: "server_job_application_created",
      properties: {
        company,
        position,
        location,
        has_salary: !!salary,
        has_job_url: !!jobUrl,
        column_name: column.name,
      },
    });

    return {
      success: true,
      message: "Job application created successfully",
      data: JSON.parse(JSON.stringify(jobApplication)),
    };
  } catch (err: unknown) {
    console.error((err as Error)?.message);
    return { success: false, message: "Failed to create job application" };
  }
}
