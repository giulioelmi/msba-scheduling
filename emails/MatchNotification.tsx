import {
  Html, Head, Body, Container, Section, Heading, Text, Button, Hr
} from "@react-email/components";
import { format, parseISO } from "date-fns";

interface Props {
  recipientName: string;
  otherPartyName: string;
  cycleName: string;
  slotStart: string;
  slotEnd: string;
  role: "student" | "candidate";
}

export function MatchNotificationEmail({
  recipientName,
  otherPartyName,
  cycleName,
  slotStart,
  slotEnd,
  role,
}: Props) {
  const start = parseISO(slotStart);
  const end = parseISO(slotEnd);
  const dateStr = format(start, "EEEE, MMMM d, yyyy");
  const timeStr = `${format(start, "h:mm a")} – ${format(end, "h:mm a")}`;

  const isStudent = role === "student";

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "Inter, system-ui, sans-serif", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", padding: "0 16px" }}>
          <Section style={{ backgroundColor: "#003B5C", borderRadius: "12px 12px 0 0", padding: "24px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#FFD100",
                display: "inline-flex", alignItems: "center", justifyContent: "center"
              }}>
                <span style={{ color: "#003B5C", fontWeight: 900, fontSize: "11px" }}>UCLA</span>
              </div>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "16px" }}>UCLA Anderson MSBA</div>
                <div style={{ color: "#93c5fd", fontSize: "13px" }}>{cycleName}</div>
              </div>
            </div>
          </Section>
          <div style={{ height: "4px", backgroundColor: "#FFD100" }} />

          <Section style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "0 0 12px 12px", border: "1px solid #e5e7eb", borderTop: "none" }}>
            <Heading style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: 0 }}>
              Your Interview is Confirmed!
            </Heading>
            <Text style={{ color: "#374151", fontSize: "15px", lineHeight: "1.6" }}>
              Hi {recipientName},
            </Text>
            <Text style={{ color: "#374151", fontSize: "15px", lineHeight: "1.6" }}>
              {isStudent
                ? `You've been matched to interview candidate `
                : `You'll be interviewed by current MSBA student `}
              <strong>{otherPartyName}</strong>.
            </Text>

            {/* Interview details box */}
            <Section style={{
              backgroundColor: "#EBF3FB",
              borderRadius: "10px",
              padding: "20px 24px",
              margin: "24px 0",
              border: "1px solid #bfdbfe",
            }}>
              <Text style={{ color: "#1e3a5f", fontWeight: 700, fontSize: "13px", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Interview Details
              </Text>
              <Text style={{ color: "#1e40af", fontSize: "18px", fontWeight: 700, margin: "0 0 4px" }}>
                {dateStr}
              </Text>
              <Text style={{ color: "#374151", fontSize: "16px", margin: 0 }}>
                {timeStr}
              </Text>
              <Text style={{ color: "#6b7280", fontSize: "13px", margin: "12px 0 0" }}>
                {isStudent
                  ? "You will receive a separate calendar invite or connection details."
                  : "A current MSBA student will reach out to you with connection details."}
              </Text>
            </Section>

            <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />

            <Text style={{ color: "#9ca3af", fontSize: "12px" }}>
              Questions? Reply to this email or contact the MSBA admissions team.
              UCLA Anderson School of Management · Los Angeles, CA 90095
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default MatchNotificationEmail;
