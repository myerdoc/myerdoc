export default function Home() {
  return (
    <main style={{ padding: "4rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
        MyERDoc
      </h1>

      <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
        Calm, experienced emergency physician guidance -
        when you are not sure what to do next.
      </p>

      <p style={{ marginBottom: "1.5rem" }}>
        MyERDoc provides on-demand access to board-certified emergency
        physicians for real-time guidance, triage insight, and next-step
        decision support.
      </p>

      <p style={{ marginBottom: "1.5rem" }}>
        This service is designed for situations where something feels
        concerning, but it is unclear whether emergency care is needed
        right now.
      </p>

      <p style={{ fontWeight: "bold", marginBottom: "1rem" }}>
        MyERDoc does not replace 911, EMS, or emergency department care.
      </p>

      <p>
        In limited cases, our physicians may recommend and prescribe
        appropriate non-controlled medications when clinically appropriate
        and legally permitted.
      </p>
    </main>
  );
}