export const submissionTypes = ["complaint", "request", "suggestion"] as const;
export type SubmissionType = (typeof submissionTypes)[number];
export type SubmissionStatus = "new" | "in_review" | "resolved";
export type SubmissionAttachment = { type: "image" | "video"; url: string; name: string };

export type CitizenSubmission = {
  id: number;
  type: SubmissionType;
  name: string;
  contact: string;
  community: string;
  message: string;
  attachments: SubmissionAttachment[];
  status: SubmissionStatus;
  created_at: string;
};
