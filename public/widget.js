/**
 * Ministry / Official Website Floating Feedback Widget
 * Embeddable script that renders a floating launcher button and interactive popup feedback form.
 *
 * Modeled after the "TALK TO VC" / "TALK TO MINISTER" floating button style.
 */

(function () {
  "use strict";

  // Prevent multiple initializations
  if (window.FisheriesWidgetInitialized) {
    return;
  }
  window.FisheriesWidgetInitialized = true;

  // Locate the current script element to extract data-* config options
  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.getElementsByTagName("script");
      return scripts[scripts.length - 1];
    })();

  const scriptSrc = (currentScript && currentScript.src) || "";
  const scriptBaseUrl = scriptSrc ? scriptSrc.substring(0, scriptSrc.lastIndexOf("/") + 1) : "";

  // Configuration with defaults
  const config = {
    apiBase:
      (currentScript && currentScript.getAttribute("data-api-base")) ||
      (scriptBaseUrl ? scriptBaseUrl + "api/" : "api/"),
    mode: (currentScript && currentScript.getAttribute("data-mode")) || "minister", // 'minister' or 'vc'
    labelTop: (currentScript && currentScript.getAttribute("data-label-top")) || "TALK",
    labelPrefix: (currentScript && currentScript.getAttribute("data-label-prefix")) || "TO",
    labelTarget: (currentScript && currentScript.getAttribute("data-label-target")) || "",
    crest: (currentScript && currentScript.getAttribute("data-crest")) || "",
    crestUrl: (currentScript && currentScript.getAttribute("data-crest-url")) || "",
    title: (currentScript && currentScript.getAttribute("data-title")) || "",
    eyebrow: (currentScript && currentScript.getAttribute("data-eyebrow")) || "",
    subtitle: (currentScript && currentScript.getAttribute("data-subtitle")) || "",
    position: (currentScript && currentScript.getAttribute("data-position")) || "bottom-right", // 'bottom-right' or 'bottom-left'
    autoOpen: currentScript && currentScript.getAttribute("data-auto-open") === "true",
  };

  // Preset definitions
  const PRESETS = {
    minister: {
      labelTop: "TALK",
      labelPrefix: "TO",
      labelTarget: "MINISTER",
      eyebrow: "MINISTRY OF FISHERIES",
      title: "Write to the Minister of Fisheries",
      subtitle:
        "Tell the Minister about a problem, a question or an idea. A member of the Ministry team will follow up with you.",
      privacyText:
        "Your phone number is required so the Ministry can contact you. Your name and email are optional; if provided, an email acknowledgement will be sent.",
      crestType: "fisheries",
    },
    vc: {
      labelTop: "TALK",
      labelPrefix: "TO",
      labelTarget: "VC",
      eyebrow: "VICE CHANCELLOR'S OFFICE",
      title: "Talk to the Vice Chancellor",
      subtitle:
        "Submit your direct inquiry, grievance, or feedback to the Vice Chancellor's office. Our team will review and follow up.",
      privacyText:
        "Your phone number is required for official verification and follow-up. An email address can be provided for digital acknowledgement.",
      crestType: "kdu",
    },
  };

  // Resolve presets
  const activePreset = PRESETS[config.mode] || PRESETS.minister;
  config.labelTop = config.labelTop || activePreset.labelTop;
  config.labelPrefix = config.labelPrefix || activePreset.labelPrefix;
  config.labelTarget = config.labelTarget || activePreset.labelTarget;
  config.eyebrow = config.eyebrow || activePreset.eyebrow;
  config.title = config.title || activePreset.title;
  config.subtitle = config.subtitle || activePreset.subtitle;
  config.privacyText = activePreset.privacyText;
  config.crest = config.crest || activePreset.crestType;

  // Ensure trailing slash on apiBase
  if (config.apiBase && !config.apiBase.endsWith("/")) {
    config.apiBase += "/";
  }

  // --------------------------------------------------------------------------
  // SVG Crest Icons
  // --------------------------------------------------------------------------
  const CRESTS = {
    fisheries: `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <!-- Gold outer laurel ring -->
        <circle cx="50" cy="50" r="46" stroke="#E5B338" stroke-width="3" fill="#0A1E3F" />
        <circle cx="50" cy="50" r="41" stroke="#FDE047" stroke-width="1" stroke-dasharray="2 2" fill="none" opacity="0.6"/>
        <!-- Anchor motif -->
        <path d="M50 16 V68 M38 34 H62" stroke="#FBBF24" stroke-width="4.5" stroke-linecap="round" />
        <circle cx="50" cy="22" r="5" stroke="#FBBF24" stroke-width="3.5" fill="none" />
        <path d="M26 50 C26 73 74 73 74 50" stroke="#FBBF24" stroke-width="5" stroke-linecap="round" fill="none" />
        <path d="M22 47 L26 52 L31 47" stroke="#FBBF24" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M78 47 L74 52 L69 47" stroke="#FBBF24" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <!-- Waves at base -->
        <path d="M30 81 C36 78 44 84 50 81 C56 78 64 84 70 81" stroke="#60A5FA" stroke-width="3" stroke-linecap="round" fill="none" />
        <circle cx="50" cy="69" r="2.5" fill="#E5B338" />
      </svg>
    `,
    kdu: `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <!-- University Crest Background -->
        <circle cx="50" cy="50" r="46" stroke="#D4AF37" stroke-width="3" fill="#0A1832" />
        <!-- Wings / Laurel spread -->
        <path d="M18 52 C24 38 38 32 50 36 C62 32 76 38 82 52 C74 56 64 54 50 64 C36 54 26 56 18 52 Z" fill="#2563EB" opacity="0.9" />
        <path d="M20 50 C32 40 45 42 50 48 C55 42 68 40 80 50" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" fill="none" />
        <!-- Central Shield -->
        <path d="M40 38 H60 V56 C60 66 50 74 50 74 C50 74 40 66 40 56 Z" fill="#991B1B" stroke="#D4AF37" stroke-width="2.5" />
        <!-- Flaming Torch / Sword of knowledge -->
        <path d="M50 30 V66" stroke="#FDE047" stroke-width="3" stroke-linecap="round" />
        <path d="M46 32 C46 26 50 22 50 22 C50 22 54 26 54 32 Z" fill="#EA580C" stroke="#FDE047" stroke-width="1.5" />
        <!-- National Star / Emblem -->
        <circle cx="50" cy="46" r="3" fill="#FDE047" />
        <!-- Ribbon Base -->
        <path d="M30 76 C42 82 58 82 70 76" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" fill="none" />
      </svg>
    `,
  };

  function getCrestHtml(crestType, customUrl) {
    if (customUrl) {
      return `<img src="${escapeHtml(customUrl)}" alt="Emblem" />`;
    }
    return CRESTS[crestType] || CRESTS.fisheries;
  }

  // --------------------------------------------------------------------------
  // Inject Scoped CSS if not already present
  // --------------------------------------------------------------------------
  function ensureStylesheet() {
    const cssId = "mfw-stylesheet";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = scriptBaseUrl ? scriptBaseUrl + "widget.css" : "widget.css";
      document.head.appendChild(link);
    }
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  const escapeHtml = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  const countWords = (text) => (text.trim().match(/\S+/gu) || []).length;
  const fmt = (n) => Number(n).toLocaleString("en-US");

  // Fallback ministry topics if API is slow or temporarily offline
  const DEFAULT_TOPICS = [
    { code: "fuel", label: "Fuel prices or fuel access" },
    { code: "prices", label: "Fair prices for fish and markets" },
    { code: "gear", label: "Boats, nets, engines or ice" },
    { code: "illegal", label: "Illegal fishing" },
    { code: "welfare", label: "Support for fishermen’s families and youth" },
    { code: "other", label: "Other" },
  ];

  // --------------------------------------------------------------------------
  // Widget Controller Class
  // --------------------------------------------------------------------------
  class FeedbackWidget {
    constructor() {
      this.isOpen = false;
      this.maxWords = 2000;
      this.topics = [];
      this.init();
    }

    init() {
      ensureStylesheet();
      this.createDom();
      this.bindEvents();
      this.loadTopics();

      if (config.autoOpen) {
        setTimeout(() => this.open(), 400);
      }
    }

    createDom() {
      // Remove any existing root
      const existing = document.getElementById("mfw-widget-root");
      if (existing) existing.remove();

      const root = document.createElement("div");
      root.id = "mfw-widget-root";
      if (config.position === "bottom-left") {
        root.classList.add("mfw-pos-left");
      }

      root.innerHTML = `
        <!-- Backdrop -->
        <div class="mfw-backdrop" id="mfwBackdrop" aria-hidden="true"></div>

        <!-- Floating Launcher Button -->
        <button type="button" class="mfw-launcher" id="mfwLauncher" aria-haspopup="dialog" aria-expanded="false" aria-label="${escapeHtml(config.title)}">
          <div class="mfw-crest-circle" aria-hidden="true">
            ${getCrestHtml(config.crest, config.crestUrl)}
            <span class="mfw-status-dot" aria-hidden="true"></span>
          </div>
          <div class="mfw-text-col">
            <span class="mfw-label-top">${escapeHtml(config.labelTop)}</span>
            <span class="mfw-label-bottom">
              <span class="mfw-label-prefix">${escapeHtml(config.labelPrefix)}</span>
              <span class="mfw-label-target">${escapeHtml(config.labelTarget)}</span>
            </span>
          </div>
        </button>

        <!-- Popup Panel / Modal -->
        <div class="mfw-panel" id="mfwPanel" role="dialog" aria-modal="true" aria-labelledby="mfwPanelTitle" aria-hidden="true">
          <!-- Header -->
          <div class="mfw-header">
            <div class="mfw-header-content">
              <div class="mfw-header-crest" aria-hidden="true">
                ${getCrestHtml(config.crest, config.crestUrl)}
              </div>
              <div class="mfw-header-titles">
                <span class="mfw-header-eyebrow" id="mfwEyebrow">${escapeHtml(config.eyebrow)}</span>
                <h2 class="mfw-header-title" id="mfwPanelTitle">${escapeHtml(config.title)}</h2>
                <p class="mfw-header-desc" id="mfwSubtitle">${escapeHtml(config.subtitle)}</p>
              </div>
            </div>
            <button type="button" class="mfw-close-btn" id="mfwCloseBtn" aria-label="Close widget">✕</button>
          </div>

          <!-- Body -->
          <div class="mfw-body">
            <!-- Privacy notice -->
            <div class="mfw-privacy-note">
              <span class="mfw-privacy-icon" aria-hidden="true">🔒</span>
              <p id="mfwPrivacyText">${escapeHtml(config.privacyText)}</p>
            </div>

            <!-- Form -->
            <form id="mfwForm" novalidate>
              <div class="mfw-form-grid">
                <div class="mfw-form-group">
                  <label class="mfw-label" for="mfwName">Name <span class="mfw-optional">(optional)</span></label>
                  <input type="text" id="mfwName" name="name" class="mfw-input" maxlength="100" autocomplete="name" placeholder="Your name" />
                  <p class="mfw-field-error" id="mfwNameError" aria-live="polite"></p>
                </div>

                <div class="mfw-form-group">
                  <label class="mfw-label" for="mfwEmail">Email <span class="mfw-optional">(optional)</span></label>
                  <input type="email" id="mfwEmail" name="email" class="mfw-input" maxlength="254" autocomplete="email" placeholder="example@email.com" />
                  <p class="mfw-field-error" id="mfwEmailError" aria-live="polite"></p>
                </div>

                <div class="mfw-form-group">
                  <label class="mfw-label" for="mfwPhone">Phone number <span class="mfw-required" aria-hidden="true">*</span></label>
                  <input type="tel" id="mfwPhone" name="phone" class="mfw-input" maxlength="25" autocomplete="tel" inputmode="tel" required placeholder="Example: 077 123 4567" />
                  <p class="mfw-field-error" id="mfwPhoneError" aria-live="polite"></p>
                </div>

                <div class="mfw-form-group">
                  <label class="mfw-label" for="mfwTopic">Topic <span class="mfw-required" aria-hidden="true">*</span></label>
                  <select id="mfwTopic" name="topic" class="mfw-select" required>
                    <option value="">Loading topics…</option>
                  </select>
                  <p class="mfw-field-error" id="mfwTopicError" aria-live="polite"></p>
                </div>

                <div class="mfw-form-group mfw-full-width">
                  <div class="mfw-label-row">
                    <label class="mfw-label" for="mfwMessage">Your message <span class="mfw-required" aria-hidden="true">*</span></label>
                    <span id="mfwWordCount" class="mfw-word-count" aria-live="off">0 / 2,000 words</span>
                  </div>
                  <textarea id="mfwMessage" name="message" class="mfw-textarea" rows="4" required maxlength="30000" placeholder="Type your message or inquiry here..."></textarea>
                  <p class="mfw-field-help" id="mfwMessageHelp">Maximum 2,000 words. Please do not include passwords or bank details.</p>
                  <p class="mfw-field-error" id="mfwMessageError" aria-live="polite"></p>
                </div>

                <!-- Bot trap -->
                <div class="mfw-hp" aria-hidden="true">
                  <label for="mfwWebsite">Website</label>
                  <input type="text" id="mfwWebsite" name="website" tabindex="-1" autocomplete="off" />
                </div>
              </div>

              <div class="mfw-banner-error" id="mfwFormError" role="alert" style="display: none;"></div>

              <button type="submit" class="mfw-submit-btn" id="mfwSubmitButton">
                <span id="mfwButtonText">Send message</span>
                <span class="mfw-btn-arrow" aria-hidden="true">→</span>
              </button>

              <p class="mfw-footnote">Fields marked with <span class="mfw-required">*</span> are required.</p>
            </form>

            <!-- Success State -->
            <div class="mfw-success-view" id="mfwSuccessView" style="display: none;" role="status">
              <div class="mfw-success-badge" aria-hidden="true">✓</div>
              <h3 class="mfw-success-title">Your message has been sent</h3>
              <p class="mfw-header-desc">Thank you. Your message has been received by our office.</p>

              <div class="mfw-ref-card">
                <span class="mfw-ref-label">Reference Number</span>
                <div class="mfw-ref-number-row">
                  <span class="mfw-ref-code" id="mfwReferenceNumber">--------</span>
                  <button type="button" class="mfw-copy-btn" id="mfwCopyBtn" title="Copy reference">Copy</button>
                </div>
              </div>

              <p class="mfw-success-note" id="mfwSuccessNote">Please keep your reference number if you need to follow up.</p>

              <div class="mfw-btn-group">
                <button type="button" class="mfw-btn-outline" id="mfwNewMsgBtn">New message</button>
                <button type="button" class="mfw-btn-primary" id="mfwDoneBtn">Done</button>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(root);
      this.root = root;
    }

    bindEvents() {
      const launcher = document.getElementById("mfwLauncher");
      const backdrop = document.getElementById("mfwBackdrop");
      const closeBtn = document.getElementById("mfwCloseBtn");
      const form = document.getElementById("mfwForm");
      const doneBtn = document.getElementById("mfwDoneBtn");
      const newMsgBtn = document.getElementById("mfwNewMsgBtn");
      const copyBtn = document.getElementById("mfwCopyBtn");

      launcher.addEventListener("click", () => this.toggle());
      backdrop.addEventListener("click", () => this.close());
      closeBtn.addEventListener("click", () => this.close());
      doneBtn.addEventListener("click", () => this.close());

      // Close on Escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen) {
          this.close();
        }
      });

      // Form validation & counting
      const nameInput = document.getElementById("mfwName");
      const emailInput = document.getElementById("mfwEmail");
      const phoneInput = document.getElementById("mfwPhone");
      const topicSelect = document.getElementById("mfwTopic");
      const msgTextarea = document.getElementById("mfwMessage");

      msgTextarea.addEventListener("input", () => {
        this.updateWordCount();
        this.validateField("message");
      });

      phoneInput.addEventListener("input", () => this.validateField("phone"));
      phoneInput.addEventListener("blur", () => this.validateField("phone"));

      emailInput.addEventListener("input", () => this.validateField("email"));
      emailInput.addEventListener("blur", () => this.validateField("email"));

      topicSelect.addEventListener("change", () => this.validateField("topic"));

      form.addEventListener("submit", (e) => this.handleSubmit(e));

      newMsgBtn.addEventListener("click", () => this.resetForm());

      copyBtn.addEventListener("click", () => {
        const ref = document.getElementById("mfwReferenceNumber").textContent;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(ref).then(() => {
            copyBtn.textContent = "Copied!";
            setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
          });
        }
      });
    }

    open() {
      this.isOpen = true;
      this.root.classList.add("mfw-open");
      const launcher = document.getElementById("mfwLauncher");
      const panel = document.getElementById("mfwPanel");
      launcher.setAttribute("aria-expanded", "true");
      panel.setAttribute("aria-hidden", "false");

      // Auto-focus phone or first field
      setTimeout(() => {
        const phone = document.getElementById("mfwPhone");
        if (phone && !phone.value) phone.focus();
      }, 150);
    }

    close() {
      this.isOpen = false;
      this.root.classList.remove("mfw-open");
      const launcher = document.getElementById("mfwLauncher");
      const panel = document.getElementById("mfwPanel");
      launcher.setAttribute("aria-expanded", "false");
      panel.setAttribute("aria-hidden", "true");
      launcher.focus();
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    async loadTopics() {
      const topicSelect = document.getElementById("mfwTopic");
      try {
        const res = await fetch(config.apiBase + "topics.php", {
          headers: { Accept: "application/json" },
        });
        const data = await res.json();
        if (res.ok && data.ok && Array.isArray(data.topics)) {
          this.topics = data.topics;
          if (data.max_words) this.maxWords = data.max_words;
        } else {
          this.topics = DEFAULT_TOPICS;
        }
      } catch (err) {
        // Fallback gracefully so form always works
        this.topics = DEFAULT_TOPICS;
      }

      topicSelect.innerHTML = '<option value="">Select a topic</option>';
      this.topics.forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t.code;
        opt.textContent = t.label;
        topicSelect.appendChild(opt);
      });

      this.updateWordCount();
    }

    updateWordCount() {
      const textarea = document.getElementById("mfwMessage");
      const countEl = document.getElementById("mfwWordCount");
      const words = countWords(textarea.value);
      countEl.textContent = `${fmt(words)} / ${fmt(this.maxWords)} words`;

      countEl.classList.toggle("mfw-over-limit", words > this.maxWords);
      countEl.classList.toggle("mfw-near-limit", words <= this.maxWords && words >= this.maxWords - 100);
    }

    setError(fieldId, errorId, message) {
      const field = document.getElementById(fieldId);
      const err = document.getElementById(errorId);
      if (field) {
        field.classList.add("mfw-has-error");
        field.setAttribute("aria-invalid", "true");
      }
      if (err) {
        err.textContent = message;
      }
    }

    clearError(fieldId, errorId) {
      const field = document.getElementById(fieldId);
      const err = document.getElementById(errorId);
      if (field) {
        field.classList.remove("mfw-has-error");
        field.removeAttribute("aria-invalid");
      }
      if (err) {
        err.textContent = "";
      }
    }

    validateField(name) {
      if (name === "email") {
        const val = document.getElementById("mfwEmail").value.trim();
        if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          this.setError("mfwEmail", "mfwEmailError", "Please enter a valid email address or leave it blank.");
          return false;
        }
        this.clearError("mfwEmail", "mfwEmailError");
        return true;
      }

      if (name === "phone") {
        const val = document.getElementById("mfwPhone").value.trim();
        const digits = (val.match(/\d/g) || []).length;
        if (!val) {
          this.setError("mfwPhone", "mfwPhoneError", "Please enter a phone number so we can contact you.");
          return false;
        }
        if (!/^\+?[0-9\s\-()]{7,25}$/.test(val) || digits < 7 || digits > 15) {
          this.setError("mfwPhone", "mfwPhoneError", "Please enter a valid phone number (7–15 digits).");
          return false;
        }
        this.clearError("mfwPhone", "mfwPhoneError");
        return true;
      }

      if (name === "topic") {
        const val = document.getElementById("mfwTopic").value;
        if (!val) {
          this.setError("mfwTopic", "mfwTopicError", "Please select a topic.");
          return false;
        }
        this.clearError("mfwTopic", "mfwTopicError");
        return true;
      }

      if (name === "message") {
        const val = document.getElementById("mfwMessage").value;
        const words = countWords(val);
        if (!val.trim()) {
          this.setError("mfwMessage", "mfwMessageError", "Please write your message.");
          return false;
        }
        if (words > this.maxWords) {
          this.setError(
            "mfwMessage",
            "mfwMessageError",
            `Your message is ${fmt(words)} words. The limit is ${fmt(this.maxWords)} words.`
          );
          return false;
        }
        this.clearError("mfwMessage", "mfwMessageError");
        return true;
      }

      return true;
    }

    setSubmitting(isSubmitting) {
      const btn = document.getElementById("mfwSubmitButton");
      const btnText = document.getElementById("mfwButtonText");
      btn.disabled = isSubmitting;
      btnText.textContent = isSubmitting ? "Sending message…" : "Send message";
    }

    async handleSubmit(e) {
      e.preventDefault();
      const formError = document.getElementById("mfwFormError");
      formError.style.display = "none";
      formError.textContent = "";

      // Validate all fields
      const isEmailValid = this.validateField("email");
      const isPhoneValid = this.validateField("phone");
      const isTopicValid = this.validateField("topic");
      const isMessageValid = this.validateField("message");

      if (!isPhoneValid || !isTopicValid || !isMessageValid || !isEmailValid) {
        // Focus first failing field
        if (!isPhoneValid) document.getElementById("mfwPhone").focus();
        else if (!isTopicValid) document.getElementById("mfwTopic").focus();
        else if (!isMessageValid) document.getElementById("mfwMessage").focus();
        else if (!isEmailValid) document.getElementById("mfwEmail").focus();
        return;
      }

      const payload = {
        name: document.getElementById("mfwName").value.trim(),
        email: document.getElementById("mfwEmail").value.trim(),
        phone: document.getElementById("mfwPhone").value.trim(),
        topic: document.getElementById("mfwTopic").value,
        message: document.getElementById("mfwMessage").value.trim(),
        website: document.getElementById("mfwWebsite").value, // Bot honeypot
      };

      this.setSubmitting(true);

      try {
        const res = await fetch(config.apiBase + "submit.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        let data = {};
        try {
          data = await res.json();
        } catch (_) {}

        if (res.ok && data.ok) {
          this.showSuccess(data, payload.email);
          return;
        }

        if (data.errors) {
          if (data.errors.phone) this.setError("mfwPhone", "mfwPhoneError", data.errors.phone);
          if (data.errors.email) this.setError("mfwEmail", "mfwEmailError", data.errors.email);
          if (data.errors.topic) this.setError("mfwTopic", "mfwTopicError", data.errors.topic);
          if (data.errors.message) this.setError("mfwMessage", "mfwMessageError", data.errors.message);
        }

        formError.textContent = data.error || "Unable to send your message. Please verify all fields.";
        formError.style.display = "block";
      } catch (err) {
        formError.textContent = "Could not reach the server. Please check your internet connection.";
        formError.style.display = "block";
      } finally {
        this.setSubmitting(false);
      }
    }

    showSuccess(data, userEmail) {
      const form = document.getElementById("mfwForm");
      const successView = document.getElementById("mfwSuccessView");
      const refEl = document.getElementById("mfwReferenceNumber");
      const noteEl = document.getElementById("mfwSuccessNote");

      refEl.textContent = data.reference || "FISH-CONFIRMED";

      if (data.email === "sent") {
        noteEl.textContent = `A confirmation email has been dispatched to ${userEmail}. Please keep your reference number for any follow-up.`;
      } else if (data.email === "failed") {
        noteEl.textContent = "Your submission was saved successfully. Email acknowledgement is temporarily delayed.";
      } else {
        noteEl.textContent = "Your message was saved successfully. A staff member will use your phone number to follow up.";
      }

      form.style.display = "none";
      successView.style.display = "flex";
    }

    resetForm() {
      const form = document.getElementById("mfwForm");
      const successView = document.getElementById("mfwSuccessView");
      const formError = document.getElementById("mfwFormError");

      form.reset();
      ["mfwName", "mfwEmail", "mfwPhone", "mfwTopic", "mfwMessage"].forEach((id) => {
        this.clearError(id, id + "Error");
      });
      formError.style.display = "none";
      this.updateWordCount();

      successView.style.display = "none";
      form.style.display = "block";
      document.getElementById("mfwPhone").focus();
    }

    setMode(mode) {
      const preset = PRESETS[mode];
      if (!preset) return;
      config.mode = mode;
      config.labelTop = preset.labelTop;
      config.labelPrefix = preset.labelPrefix;
      config.labelTarget = preset.labelTarget;
      config.eyebrow = preset.eyebrow;
      config.title = preset.title;
      config.subtitle = preset.subtitle;
      config.privacyText = preset.privacyText;
      config.crest = preset.crestType;

      // Rebuild DOM to apply changes
      this.createDom();
      this.bindEvents();
      this.loadTopics();
    }
  }

  // Initialize on DOMContentLoaded or immediately if already loaded
  function boot() {
    window.FisheriesWidget = new FeedbackWidget();
    window.TalkWidget = window.FisheriesWidget;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
