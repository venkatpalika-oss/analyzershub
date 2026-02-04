async function runAI() {
  const analyzer = document.getElementById("analyzer").value;
  const detector = document.getElementById("detector").value;
  const question = document.getElementById("question").value;
  const answerBox = document.getElementById("answer");

  answerBox.innerText = "Thinking...";

  try {
    const res = await fetch(
      "https://us-central1-instmates.cloudfunctions.net/askAI",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analyzer,
          detector,
          question,
          knowledge: "Use field troubleshooting knowledge"
        })
      }
    );

    const data = await res.json();
    answerBox.innerText = data.answer || "No answer returned";

  } catch (err) {
    answerBox.innerText = "Error connecting to AI backend.";
  }
}
