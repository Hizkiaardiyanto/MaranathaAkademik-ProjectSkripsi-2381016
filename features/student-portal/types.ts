export type StudentSession = {
  email: string;
  role: string;
  name: string;
  grade: string;
};

export type ImportantAnnouncement = {
  id: string;
  title: string;
  message: string;
  publishedAt: string;
  priority?: "normal" | "urgent";
};
