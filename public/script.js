(() => {
  "use strict";

  // If this page is hosted on a different domain from the API, use the full URL,
  // e.g. "https://feedback.fisheries.gov.example/api/". Must end with "/".
  const API_BASE = "api/";

  let maxWords = 2000;

  const $ = (id) => document.getElementById(id);
  const form = $("feedbackForm");
  const fields = {
    name: $("name"),
    email: $("email"),
    phone: $("phone"),
    topic: $("topic"),
    message: $("message"),
  };
  const errorEls = {
    name: $("nameError"),
    email: $("emailError"),
    phone: $("phoneError"),
    topic: $("topicError"),
    message: $("messageError"),
  };
  const wordCountEl = $("wordCount");
  const formError = $("formError");
  const submitButton = $("submitButton");
  const buttonText = $("buttonText");
  const successBox = $("successMessage");

  // ---------------------------------------------------------------- helpers
  const countWords = (text) => (text.trim().match(/\S+/gu) || []).length;
  const fmt = (n) => n.toLocaleString("en-US");
  const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  function setError(key, message) {
    fields[key].classList.add("input-error");
    fields[key].setAttribute("aria-invalid", "true");
    errorEls[key].textContent = message;
  }

  function clearError(key) {
    fields[key].classList.remove("input-error");
    fields[key].removeAttribute("aria-invalid");
    errorEls[key].textContent = "";
  }

  function showFormError(message) {
    formError.textContent = message;
    formError.hidden = !message;
  }

  // ------------------------------------------------------------- validators
  // Each returns true when valid. Mirrors the checks in api/submit.php
  // (the server is the real gatekeeper; this is for quick feedback).
  const validators = {
    name() {
      clearError("name");
      return true;
    },

    email() {
      const v = fields.email.value.trim();
      if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        setError("email", "Please enter a valid email address, or leave it blank.");
        return false;
      }
      clearError("email");
      return true;
    },

    phone() {
      const v = fields.phone.value.trim();
      const digits = (v.match(/\d/g) || []).length;
      if (!v) {
        setError("phone", "Please enter a phone number so we can contact you.");
        return false;
      }
      if (!/^\+?[0-9\s\-()]{7,25}$/.test(v) || digits < 7 || digits > 15) {
        setError("phone", "Please enter a valid phone number (7–15 digits).");
        return false;
      }
      clearError("phone");
      return true;
    },

    topic() {
      if (!fields.topic.value) {
        setError("topic", "Please choose a topic.");
        return false;
      }
      clearError("topic");
      return true;
    },

    message() {
      const v = fields.message.value;
      const words = countWords(v);
      if (!v.trim()) {
        setError("message", "Please write your message.");
        return false;
      }
      if (words > maxWords) {
        setError("message", `Your message is ${fmt(words)} words. The limit is ${fmt(maxWords)} words.`);
        return false;
      }
      clearError("message");
      return true;
    },
  };

  function updateWordCount() {
    const words = countWords(fields.message.value);
    wordCountEl.textContent = `${fmt(words)} / ${fmt(maxWords)} words`;
    wordCountEl.classList.toggle("over-limit", words > maxWords);
    wordCountEl.classList.toggle("near-limit", words <= maxWords && words >= maxWords - 100);
  }

  // ------------------------------------------------------------- load topics
  async function loadTopics() {
    try {
      const res = await fetch(API_BASE + "topics.php", { headers: { Accept: "application/json" } });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error("bad response");

      maxWords = data.max_words || maxWords;
      fields.topic.replaceChildren(new Option("Select a topic", ""));
      data.topics.forEach((t) => fields.topic.add(new Option(t.label, t.code)));
      submitButton.disabled = false;
      updateWordCount();
    } catch (err) {
      fields.topic.replaceChildren(new Option("Topics unavailable", ""));
      showFormError("The form could not be loaded. Please refresh the page or try again later.");
    }
  }

  // ------------------------------------------------------------------ submit
  function setSubmitting(on) {
    submitButton.disabled = on;
    buttonText.textContent = on ? "Sending…" : "Send message";
  }

  function showSuccess(result, email) {
    $("referenceNumber").textContent = result.reference;

    const note = $("successEmailNote");
    if (result.email === "sent") {
      note.textContent = `A confirmation email has been sent to ${email}.`;
    } else if (result.email === "failed") {
      note.textContent = result.email_error
        ? `We could not send a confirmation email (${result.email_error}), but your message was received.`
        : "We could not send a confirmation email, but your message was received.";
    } else if (result.email === "skipped") {
      note.textContent = "Confirmation emails are currently disabled, but your message was received.";
    } else {
      note.textContent = "";
    }
    note.hidden = !note.textContent;

    form.hidden = true;
    successBox.hidden = false;
    successBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showFormError("");

    // Run every validator (no short-circuit) so all problems show at once.
    const results = Object.keys(validators).map((k) => [k, validators[k]()]);
    const firstBad = results.find(([, ok]) => !ok);
    if (firstBad) {
      fields[firstBad[0]].focus();
      return;
    }

    const payload = {
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim(),
      topic: fields.topic.value,
      message: fields.message.value.trim(),
      website: $("website").value, // honeypot – should stay empty
    };

    setSubmitting(true);
    try {
      const res = await fetch(API_BASE + "submit.php", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      let data = {};
      try { data = await res.json(); } catch (_) { /* non-JSON error page */ }

      if (res.ok && data.ok) {
        showSuccess(data, payload.email);
        return;
      }

      if (data.errors) {
        let focused = false;
        Object.entries(data.errors).forEach(([key, msg]) => {
          if (fields[key]) {
            setError(key, msg);
            if (!focused) { fields[key].focus(); focused = true; }
          }
        });
      }
      showFormError(data.error || "Something went wrong. Please try again.");
    } catch (err) {
      showFormError("We could not reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  });

  // --------------------------------------------------------------- listeners
  fields.email.addEventListener("blur", validators.email);
  fields.phone.addEventListener("blur", validators.phone);
  fields.topic.addEventListener("change", validators.topic);
  fields.message.addEventListener("blur", validators.message);
  fields.message.addEventListener("input", () => {
    updateWordCount();
    if (fields.message.classList.contains("input-error")) validators.message();
  });
  // Clear an error as soon as the person starts fixing the field.
  ["email", "phone"].forEach((k) => fields[k].addEventListener("input", () => {
    if (fields[k].classList.contains("input-error")) validators[k]();
  }));

  $("newFeedbackButton").addEventListener("click", () => {
    form.reset();
    Object.keys(fields).forEach(clearError);
    showFormError("");
    updateWordCount();
    successBox.hidden = true;
    form.hidden = false;
    fields.name.focus();
  });

  updateWordCount();
  loadTopics();
})();
