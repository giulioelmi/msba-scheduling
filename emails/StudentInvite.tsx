import {
  Html, Head, Body, Container, Section, Heading, Text, Button, Hr, Img
} from "@react-email/components";

interface Props {
  studentName: string;
  cycleName: string;
  url: string;
}

export function StudentInviteEmail({ studentName, cycleName, url }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "Inter, system-ui, sans-serif", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", padding: "0 16px" }}>
          {/* UCLA Header */}
          <Section style={{ backgroundColor: "#003B5C", borderRadius: "12px 12px 0 0", padding: "24px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#FFD100",
                display: "inline-flex", alignItems: "center", justifyContent: "center"
              }}>
                <span style={{ color: "#003B5C", fontWeight: 900, fontSize: "11px" }}>UCLA</span>
              </div>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "16px" }}>UCLA Anderson</div>
                <div style={{ color: "#93c5fd", fontSize: "13px" }}>MSBA Program</div>
              </div>
            </div>
          </Section>
          <div style={{ height: "4px", backgroundColor: "#FFD100", borderRadius: "0" }} />

          {/* Body */}
          <Section style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "0 0 12px 12px", border: "1px solid #e5e7eb", borderTop: "none" }}>
            <Heading style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: 0, marginBottom: "8px" }}>
              Volunteer to Interview MSBA Candidates
            </Heading>
            <Text style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
              Hi {studentName},
            </Text>
            <Text style={{ color: "#374151", fontSize: "15px", lineHeight: "1.6", marginBottom: "16px" }}>
              The <strong>{cycleName}</strong> is underway! As a current MSBA student, you have the opportunity
              to conduct second-round interviews with prospective students.
            </Text>
            <Text style={{ color: "#374151", fontSize: "15px", lineHeight: "1.6", marginBottom: "24px" }}>
              Please click below to share your availability. The process takes about 2 minutes.
            </Text>

            <Button
              href={url}
              style={{
                backgroundColor: "#2774AE",
                color: "#fff",
                borderRadius: "8px",
                padding: "12px 24px",
                fontWeight: 600,
                fontSize: "15px",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Share My Availability →
            </Button>

            <Hr style={{ borderColor: "#e5e7eb", margin: "32px 0" }} />

            <Text style={{ color: "#9ca3af", fontSize: "12px" }}>
              This link is unique to you — please don&apos;t share it. If you have questions, reply to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default StudentInviteEmail;
