export default function HowItWorks() {
  return (
    <main style={{ padding: "4rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.2rem", marginBottom: "2rem" }}>
        How MyERDoc Works
      </h1>

      <ol style={{ paddingLeft: "1.2rem" }}>
        <li style={{ marginBottom: "1.5rem" }}>
          <strong>You have a concerning situation.</strong>
          <br />
          Something does not feel right, but it is not clear whether
          emergency care is needed right now.
        </li>

        <li style={{ marginBottom: "1.5rem" }}>
          <strong>You connect with an experienced ER physician.</strong>
          <br />
          You speak directly with a board-certified emergency physician
          who evaluates the situation based on your history and symptoms.
        </li>

        <li style={{ marginBottom: "1.5rem" }}>
          <strong>You receive clear guidance.</strong>
          <br />
          We focus on urgency, risk, and next steps, not exhaustive testing
          or ongoing care.
        </li>

        <li style={{ marginBottom: "1.5rem" }}>
          <strong>You decide what to do next.</strong>
          <br />
          That may include monitoring at home, urgent care, contacting
          your primary doctor, or going to the emergency department.
        </li>

        <li style={{ marginBottom: "1.5rem" }}>
          <strong>In limited cases, treatment may be recommended.</strong>
          <br />
          When clinically appropriate and legally permitted, our physicians
          may recommend or prescribe non-controlled medications to support
          symptom relief or short-term care.
        </li>
      </ol>

      <p style={{ marginTop: "2rem", fontWeight: "bold" }}>
        If you believe you are experiencing a medical emergency, call 911
        or seek emergency care immediately.
      </p>
    </main>
  );
}