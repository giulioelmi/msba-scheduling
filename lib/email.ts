import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { StudentInviteEmail } from "@/emails/StudentInvite";
import { CandidateInviteEmail } from "@/emails/CandidateInvite";
import { MatchNotificationEmail } from "@/emails/MatchNotification";

const FROM = process.env.SMTP_FROM ?? "MSBA Admissions <msba@ucla.edu>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Nodemailer transporter using SMTP credentials.
// Defaults to Microsoft 365 (UCLA's mail server).
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.office365.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false, // STARTTLS on port 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendStudentInvite({
  to,
  studentName,
  cycleName,
  token,
}: {
  to: string;
  studentName: string;
  cycleName: string;
  token: string;
}) {
  const url = `${APP_URL}/s/${token}`;
  const html = await render(StudentInviteEmail({ studentName, cycleName, url }));

  return createTransporter().sendMail({
    from: FROM,
    to,
    subject: `[MSBA] Volunteer for ${cycleName} Interviews`,
    html,
  });
}

export async function sendCandidateInvite({
  to,
  candidateName,
  cycleName,
  token,
}: {
  to: string;
  candidateName: string;
  cycleName: string;
  token: string;
}) {
  const url = `${APP_URL}/a/${token}`;
  const html = await render(CandidateInviteEmail({ candidateName, cycleName, url }));

  return createTransporter().sendMail({
    from: FROM,
    to,
    subject: `[UCLA MSBA] Schedule Your Interview — ${cycleName}`,
    html,
  });
}

export async function sendMatchNotification({
  studentEmail,
  studentName,
  candidateEmail,
  candidateName,
  cycleName,
  slotStart,
  slotEnd,
}: {
  studentEmail: string;
  studentName: string;
  candidateEmail: string;
  candidateName: string;
  cycleName: string;
  slotStart: string;
  slotEnd: string;
}) {
  const transporter = createTransporter();

  const [studentHtml, candidateHtml] = await Promise.all([
    render(MatchNotificationEmail({ recipientName: studentName, otherPartyName: candidateName, cycleName, slotStart, slotEnd, role: "student" })),
    render(MatchNotificationEmail({ recipientName: candidateName, otherPartyName: studentName, cycleName, slotStart, slotEnd, role: "candidate" })),
  ]);

  const [studentResult, candidateResult] = await Promise.all([
    transporter.sendMail({
      from: FROM,
      to: studentEmail,
      subject: `[MSBA] Your Interview Match — ${candidateName}`,
      html: studentHtml,
    }),
    transporter.sendMail({
      from: FROM,
      to: candidateEmail,
      subject: `[UCLA MSBA] Your Interview is Scheduled`,
      html: candidateHtml,
    }),
  ]);

  return { studentResult, candidateResult };
}
