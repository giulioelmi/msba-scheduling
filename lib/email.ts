import { Resend } from "resend";
import { StudentInviteEmail } from "@/emails/StudentInvite";
import { CandidateInviteEmail } from "@/emails/CandidateInvite";
import { MatchNotificationEmail } from "@/emails/MatchNotification";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL ?? "MSBA Admissions <admissions@example.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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
  return resend.emails.send({
    from: FROM,
    to,
    subject: `[MSBA] Volunteer for ${cycleName} Interviews`,
    react: StudentInviteEmail({ studentName, cycleName, url }),
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
  return resend.emails.send({
    from: FROM,
    to,
    subject: `[UCLA MSBA] Schedule Your Interview — ${cycleName}`,
    react: CandidateInviteEmail({ candidateName, cycleName, url }),
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
  const [studentResult, candidateResult] = await Promise.all([
    resend.emails.send({
      from: FROM,
      to: studentEmail,
      subject: `[MSBA] Your Interview Match — ${candidateName}`,
      react: MatchNotificationEmail({
        recipientName: studentName,
        otherPartyName: candidateName,
        cycleName,
        slotStart,
        slotEnd,
        role: "student",
      }),
    }),
    resend.emails.send({
      from: FROM,
      to: candidateEmail,
      subject: `[UCLA MSBA] Your Interview is Scheduled`,
      react: MatchNotificationEmail({
        recipientName: candidateName,
        otherPartyName: studentName,
        cycleName,
        slotStart,
        slotEnd,
        role: "candidate",
      }),
    }),
  ]);

  return { studentResult, candidateResult };
}
