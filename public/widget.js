/**
 * Ministry of Fisheries, Aquatic and Ocean Resources - Sri Lanka
 * Official Floating Chat & Feedback Widget
 * Website: https://www.fisheries.gov.lk/
 *
 * Designed with authentic Ministry Ocean Teal branding, trilingual support (EN / SI / TA),
 * quick topic pills, conversational greeting, and human-first interactions.
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

  // --------------------------------------------------------------------------
  // Trilingual Localization (English, Sinhala, Tamil)
  // --------------------------------------------------------------------------
  const I18N = {
    en: {
      langName: "English",
      headerEyebrow: "MINISTRY OF FISHERIES",
      headerTitle: "Talk to the Minister",
      headerStatus: "Desk Active • Response within 24-48 hrs",
      launcherTop: "TALK TO",
      launcherTarget: "MINISTER",
      teaserText: "👋 Have a question or feedback? We're here to assist you.",
      chatBubbleTitle: "PUBLIC ASSISTANCE DESK",
      chatBubbleText: "Hello! Tell the Minister and the Ministry team about a problem, a question, or an idea. We will follow up with you.",
      topicChipsLabel: "Choose a topic to begin:",
      nameLabel: "Name",
      optional: "(optional)",
      namePlaceholder: "Your full name",
      emailLabel: "Email address",
      emailPlaceholder: "example@email.com",
      phoneLabel: "Phone number",
      phoneRequired: "*",
      phoneHelp: "Required so our ministry officer can contact you",
      phonePlaceholder: "Example: 077 123 4567",
      topicLabel: "Topic",
      topicPlaceholder: "Select a topic...",
      messageLabel: "Your message",
      messagePlaceholder: "Write your message, grievance or idea to the Ministry here...",
      messageHelp: "Maximum 2,000 words. Please do not include passwords or bank details.",
      submitBtn: "Send message",
      submitting: "Sending message…",
      footnote: "Fields marked with * are required for follow-up.",
      successTitle: "Your message has been received",
      successSubtitle: "Thank you. Your message has been safely logged with the Ministry of Fisheries.",
      refLabel: "Reference Number",
      copyBtn: "Copy",
      copiedBtn: "Copied!",
      successNotePhone: "A ministry officer will use your phone number to follow up with you.",
      successNoteEmail: "A confirmation email has been sent to your address. Please keep your reference number.",
      newMsgBtn: "New message",
      doneBtn: "Done",
      errEmail: "Please enter a valid email address or leave it blank.",
      errPhoneReq: "Please enter a phone number so we can contact you.",
      errPhoneInvalid: "Please enter a valid phone number (7–15 digits).",
      errTopicReq: "Please select a topic.",
      errMessageReq: "Please write your message.",
      errMessageLimit: "Your message exceeds the word limit.",
      errNetwork: "Could not reach the server. Please check your internet connection.",
      topics: {
        prices: "🐟 Fish Prices & Market",
        fuel: "⛽ Fuel & Subsidies",
        gear: "🚤 Boats, Nets & Gear",
        harbour: "🌊 Harbours & Anchorages",
        illegal: "🛡️ Report Illegal Fishing",
        welfare: "🤝 Welfare & Pensions",
        other: "💬 General Inquiry",
      },
    },
    si: {
      langName: "සිංහල",
      headerEyebrow: "ධීවර, ජලජ හා සාගර සම්පත් අමාත්‍යාංශය",
      headerTitle: "ඇමතිතුමාට පවසන්න",
      headerStatus: "සක්‍රීයයි • පැය 24-48 තුළ ප්‍රතිචාර",
      launcherTop: "පණිවිඩයක් යවන්න",
      launcherTarget: "ධීවර අමාත්‍යාංශය",
      teaserText: "👋 ගැටලුවක් හෝ අදහසක් තිබේද? අපි ඔබට සවන් දීමට සූදානම්.",
      chatBubbleTitle: "මහජන සහන සහ සේවා අංශය",
      chatBubbleText: "ආයුබෝවන්! ධීවර අමාත්‍යතුමා සහ අමාත්‍යාංශ නිලධාරීන් වෙත ඔබගේ ගැටලුව, විමසීම හෝ අදහස යොමු කරන්න. අපි ඔබ හා සම්බන්ධ වන්නෙමු.",
      topicChipsLabel: "මාතෘකාවක් තෝරන්න:",
      nameLabel: "ඔබගේ නම",
      optional: "(විකල්ප)",
      namePlaceholder: "සම්පූර්ණ නම",
      emailLabel: "විද්‍යුත් තැපෑල",
      emailPlaceholder: "example@email.com",
      phoneLabel: "දුරකථන අංකය",
      phoneRequired: "*",
      phoneHelp: "ඇමතුමක් ලබා ගැනීමට දුරකථන අංකය අනිවාර්ය වේ",
      phonePlaceholder: "උදා: 077 123 4567",
      topicLabel: "මාතෘකාව",
      topicPlaceholder: "මාතෘකාව තෝරන්න...",
      messageLabel: "ඔබගේ පණිවිඩය",
      messagePlaceholder: "ඔබගේ ගැටලුව, අදහස හෝ යෝජනාව මෙහි ලියන්න...",
      messageHelp: "උපරිම වචන 2,000 කි. බැංකු තොරතුරු හෝ මුරපද ඇතුළත් නොකරන්න.",
      submitBtn: "පණිවිඩය යවන්න",
      submitting: "යවමින් පවතී…",
      footnote: "* සලකුණු කළ තොරතුරු අනිවාර්ය වේ.",
      successTitle: "ඔබගේ පණිවිඩය ලැබිණි",
      successSubtitle: "ස්තූතියි. ඔබගේ පණිවිඩය ධීවර අමාත්‍යාංශය වෙත සාර්ථකව යොමු විය.",
      refLabel: "යොමු අංකය",
      copyBtn: "පිටපත්",
      copiedBtn: "පිටපත් විය!",
      successNotePhone: "අමාත්‍යාංශ නිලධාරියෙකු ඔබගේ දුරකථන අංකය ඔස්සේ සම්බන්ධ වනු ඇත.",
      successNoteEmail: "තහවුරු කිරීමේ ඊමේල් පණිවිඩයක් ඔබගේ ලිපිනයට එවා ඇත.",
      newMsgBtn: "නව පණිවිඩයක්",
      doneBtn: "අවසන්",
      errEmail: "කරුණාකර නිවැරදි ඊමේල් ලිපිනයක් ඇතුළත් කරන්න.",
      errPhoneReq: "කරුණාකර ඔබගේ දුරකථන අංකය ඇතුළත් කරන්න.",
      errPhoneInvalid: "කරුණාකර වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න (ඉලක්කම් 7-15).",
      errTopicReq: "කරුණාකර මාතෘකාවක් තෝරන්න.",
      errMessageReq: "කරුණාකර ඔබගේ පණිවිඩය ලියන්න.",
      errMessageLimit: "පණිවිඩයේ වචන සීමාව ඉක්මවා ඇත.",
      errNetwork: "සේවාදායකය හා සම්බන්ධ විය නොහැක. අන්තර්ජාලය පරීක්ෂා කරන්න.",
      topics: {
        prices: "🐟 සාධාරණ මාළු මිල සහ වෙළඳපොළ",
        fuel: "⛽ ඉන්ධන සහනාධාර සහ මිල",
        gear: "🚤 බෝට්ටු, එන්ජින් සහ දැල් ආම්පන්න",
        harbour: "🌊 ධීවර වරාය සහ නැංගුරම් පොළවල්",
        illegal: "🛡️ නීති විරෝධී ධීවර කටයුතු වාර්තා කිරීම",
        welfare: "🤝 ධීවර සුබසාධනය සහ විශ්‍රාම වැටුප්",
        other: "💬 වෙනත් පොදු විමසීම්",
      },
    },
    ta: {
      langName: "தமிழ்",
      headerEyebrow: "கடற்றொழில், நீரியல் மற்றும் கடல் வளங்கள் அமைச்சு",
      headerTitle: "அமைச்சருக்கு எழுதுங்கள்",
      headerStatus: "தயார் நிலை • 24-48 மணிநேரத்தில் பதில்",
      launcherTop: "செய்தி அனுப்புக",
      launcherTarget: "கடற்றொழில் அமைச்சு",
      teaserText: "👋 கேள்வியா அல்லது யோசனையா? உங்களுக்கு உதவ நாங்கள் தயார்.",
      chatBubbleTitle: "பொதுமக்கள் உதவி மற்றும் சேவைப் பிரிவு",
      chatBubbleText: "வணக்கம்! உங்கள் பிரச்சனை, கேள்வி அல்லது ஆலோசனையை கடற்றொழில் அமைச்சர் மற்றும் அமைச்சு குழுவிடம் தெரிவியுங்கள். நாங்கள் உங்களைத் தொடர்புகொள்வோம்.",
      topicChipsLabel: "விடயத்தைத் தெரிவுசெய்க:",
      nameLabel: "உங்கள் பெயர்",
      optional: "(விருப்பத்திற்குரியது)",
      namePlaceholder: "முழுப் பெயர்",
      emailLabel: "மின்னஞ்சல் முகவரி",
      emailPlaceholder: "example@email.com",
      phoneLabel: "தொலைபேசி எண்",
      phoneRequired: "*",
      phoneHelp: "உங்களைத் தொடர்பு கொள்ள தொலைபேசி எண் அவசியம்",
      phonePlaceholder: "உதா: 077 123 4567",
      topicLabel: "விடயம்",
      topicPlaceholder: "விடயத்தைத் தெரிவுசெய்க...",
      messageLabel: "உங்கள் செய்தி",
      messagePlaceholder: "உங்கள் செய்தி, பிரச்சனை அல்லது ஆலோசனையை இங்கே எழுதவும்...",
      messageHelp: "அதிகபட்சம் 2,000 வார்த்தைகள். கடவுச்சொற்கள் அல்லது வங்கி விபரங்களை உள்ளிட வேண்டாம்.",
      submitBtn: "செய்தியை அனுப்புக",
      submitting: "அனுப்பப்படுகிறது…",
      footnote: "* குறியிடப்பட்ட தகவல்கள் கட்டாயமாகும்.",
      successTitle: "உங்கள் செய்தி பெறப்பட்டது",
      successSubtitle: "நன்றி. உங்கள் செய்தி கடற்றொழில் அமைச்சிடம் வெற்றிகரமாகச் சமர்ப்பிக்கப்பட்டது.",
      refLabel: "குறிப்பு எண்",
      copyBtn: "பிரதி செய்",
      copiedBtn: "பிரதி செய்யப்பட்டது!",
      successNotePhone: "அமைச்சு அதிகாரி ஒருவர் உங்கள் தொலைபேசி எண் மூலம் உங்களைத் தொடர்புகொள்வார்.",
      successNoteEmail: "உறுதிப்படுத்தல் மின்னஞ்சல் உங்கள் முகவரிக்கு அனுப்பப்பட்டுள்ளது.",
      newMsgBtn: "புதிய செய்தி",
      doneBtn: "முடிந்தது",
      errEmail: "சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.",
      errPhoneReq: "தயவுசெய்து உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்.",
      errPhoneInvalid: "சரியான தொலைபேசி எண்ணை உள்ளிடவும் (7-15 இலக்கங்கள்).",
      errTopicReq: "தயவுசெய்து விடயமொன்றைத் தெரிவுசெய்க.",
      errMessageReq: "தயவுசெய்து உங்கள் செய்தியை எழுதவும்.",
      errMessageLimit: "வார்த்தை வரம்பை மீறிவிட்டது.",
      errNetwork: "சேவையகத்தை அணுக முடியவில்லை. இணைய இணைப்பை சரிபார்க்கவும்.",
      topics: {
        prices: "🐟 நியாயமான மீன் விலை & சந்தைப்படுத்தல்",
        fuel: "⛽ எரிபொருள் மானியம் மற்றும் விலை",
        gear: "🚤 படகுகள், இயந்திரங்கள் & வலைகள்",
        harbour: "🌊 மீன்பிடி துறைமுகங்கள் & தளங்கள்",
        illegal: "🛡️ சட்டவிரோத மீன்பிடி அறிக்கை",
        welfare: "🤝 மீனவர் நலன்புரி & ஓய்வூதியம்",
        other: "💬 பொதுவான விசாரணைகள்",
      },
    },
  };

  // --------------------------------------------------------------------------
  // Configuration with Defaults
  // --------------------------------------------------------------------------
  const config = {
    apiBase:
      (currentScript && currentScript.getAttribute("data-api-base")) ||
      (scriptBaseUrl ? scriptBaseUrl + "api/" : "api/"),
    theme: (currentScript && currentScript.getAttribute("data-theme")) || "ocean", // 'ocean' (default), 'coastal', 'minimal'
    lang: (currentScript && currentScript.getAttribute("data-lang")) || "en", // 'en', 'si', 'ta'
    position: (currentScript && currentScript.getAttribute("data-position")) || "bottom-right",
    autoOpen: currentScript && currentScript.getAttribute("data-auto-open") === "true",
    showTeaser: currentScript ? currentScript.getAttribute("data-teaser") === "true" : false,
  };

  if (config.apiBase && !config.apiBase.endsWith("/")) {
    config.apiBase += "/";
  }

  // Active language state
  let currentLang = I18N[config.lang] ? config.lang : "en";

  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // Official National Emblem of Sri Lanka
  // --------------------------------------------------------------------------
  const SRI_LANKA_EMBLEM_SRC =
    (currentScript && currentScript.getAttribute("data-crest-url")) ||
    (scriptBaseUrl ? scriptBaseUrl + "emblem-sri-lanka.png" : "emblem-sri-lanka.png");

  function getEmblemHtml() {
    return `<img src="${escapeHtml(SRI_LANKA_EMBLEM_SRC)}" alt="National Emblem of Sri Lanka" class="mfw-emblem-img" />`;
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  const escapeHtml = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  const countWords = (text) => (text.trim().match(/\S+/gu) || []).length;
  const fmt = (n) => Number(n).toLocaleString("en-US");

  // Fallback default topic keys
  const TOPIC_KEYS = ["fuel", "prices", "gear", "harbour", "illegal", "welfare", "other"];

  // --------------------------------------------------------------------------
  // Inject Stylesheet
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
  // Widget Controller Class
  // --------------------------------------------------------------------------
  class FeedbackWidget {
    constructor() {
      this.isOpen = false;
      this.maxWords = 2000;
      this.topics = [];
      this.selectedTopicCode = "";
      this.init();
    }

    init() {
      ensureStylesheet();
      this.createDom();
      this.bindEvents();
      this.loadTopics();

      if (config.autoOpen) {
        setTimeout(() => this.open(), 500);
      }
    }

    t(key) {
      const dict = I18N[currentLang] || I18N.en;
      return dict[key] !== undefined ? dict[key] : I18N.en[key] || "";
    }

    createDom() {
      const existing = document.getElementById("mfw-widget-root");
      if (existing) existing.remove();

      const root = document.createElement("div");
      root.id = "mfw-widget-root";
      if (config.theme) {
        root.setAttribute("data-theme", config.theme);
      }
      if (config.position === "bottom-left" || config.position === "top-left") {
        root.classList.add("mfw-pos-left");
      }

      root.innerHTML = `
        <!-- Teaser Greeting Callout -->
        <div class="mfw-teaser-bubble" id="mfwTeaser" role="region" aria-label="Greeting">
          <span class="mfw-teaser-emoji" aria-hidden="true">👋</span>
          <p class="mfw-teaser-text" id="mfwTeaserText">${escapeHtml(this.t("teaserText"))}</p>
          <button type="button" class="mfw-teaser-close" id="mfwTeaserClose" aria-label="Dismiss greeting">✕</button>
        </div>

        <!-- Backdrop Overlay -->
        <div class="mfw-backdrop" id="mfwBackdrop" aria-hidden="true"></div>

        <!-- Floating Launcher Pill Button -->
        <button type="button" class="mfw-launcher" id="mfwLauncher" aria-haspopup="dialog" aria-expanded="false" aria-label="${escapeHtml(this.t("headerTitle"))}">
          <div class="mfw-crest-circle" aria-hidden="true">
            ${getEmblemHtml()}
            <span class="mfw-status-dot" aria-hidden="true"></span>
          </div>
          <div class="mfw-text-col">
            <span class="mfw-label-top" id="mfwLauncherTop">${escapeHtml(this.t("launcherTop"))}</span>
            <span class="mfw-label-bottom">
              <span class="mfw-label-target" id="mfwLauncherTarget">${escapeHtml(this.t("launcherTarget"))}</span>
            </span>
          </div>
        </button>

        <!-- Conversational Chat & Feedback Panel -->
        <div class="mfw-panel" id="mfwPanel" role="dialog" aria-modal="true" aria-labelledby="mfwPanelTitle" aria-hidden="true">
          <!-- Header -->
          <div class="mfw-header">
            <div class="mfw-header-top-row">
              <div class="mfw-header-brand">
                <div class="mfw-header-avatar" aria-hidden="true">
                  ${getEmblemHtml()}
                  <span class="mfw-header-avatar-status" title="Active"></span>
                </div>
                <div class="mfw-header-titles">
                  <span class="mfw-header-eyebrow" id="mfwEyebrow">${escapeHtml(this.t("headerEyebrow"))}</span>
                  <h2 class="mfw-header-title" id="mfwPanelTitle">${escapeHtml(this.t("headerTitle"))}</h2>
                </div>
              </div>

              <div class="mfw-header-actions">
                <!-- Trilingual Switcher -->
                <div class="mfw-lang-switcher" role="radiogroup" aria-label="Language">
                  <button type="button" class="mfw-lang-btn ${currentLang === 'en' ? 'mfw-lang-active' : ''}" data-lang="en">EN</button>
                  <button type="button" class="mfw-lang-btn ${currentLang === 'si' ? 'mfw-lang-active' : ''}" data-lang="si">සිං</button>
                  <button type="button" class="mfw-lang-btn ${currentLang === 'ta' ? 'mfw-lang-active' : ''}" data-lang="ta">தம</button>
                </div>
                <button type="button" class="mfw-close-btn" id="mfwCloseBtn" aria-label="Close widget">✕</button>
              </div>
            </div>

            <!-- Live Status Line -->
            <div class="mfw-header-status-line">
              <span class="mfw-status-live-dot" aria-hidden="true"></span>
              <span id="mfwHeaderStatus">${escapeHtml(this.t("headerStatus"))}</span>
            </div>
          </div>

          <!-- Body -->
          <div class="mfw-body">
            <!-- Conversational Welcome Speech Bubble -->
            <div class="mfw-chat-bubble">
              <div class="mfw-chat-bubble-header">
                <span aria-hidden="true">💬</span>
                <span id="mfwBubbleTitle">${escapeHtml(this.t("chatBubbleTitle"))}</span>
              </div>
              <p class="mfw-chat-bubble-text" id="mfwBubbleText">${escapeHtml(this.t("chatBubbleText"))}</p>
            </div>

            <!-- Quick Topic Pills / Chips -->
            <div class="mfw-topic-chips-section">
              <label class="mfw-topic-chips-label" id="mfwTopicChipsLabel">${escapeHtml(this.t("topicChipsLabel"))}</label>
              <div class="mfw-topic-chips" id="mfwTopicChips">
                <!-- Rendered dynamically -->
              </div>
            </div>

            <!-- Interactive Form -->
            <form id="mfwForm" novalidate>
              <div class="mfw-form-grid">
                <!-- Phone Number (Primary direct contact) -->
                <div class="mfw-form-group mfw-full-width">
                  <label class="mfw-label" for="mfwPhone">
                    <span id="mfwPhoneLabel">${escapeHtml(this.t("phoneLabel"))}</span>
                    <span class="mfw-required" aria-hidden="true">*</span>
                  </label>
                  <input type="tel" id="mfwPhone" name="phone" class="mfw-input" maxlength="25" autocomplete="tel" inputmode="tel" required placeholder="${escapeHtml(this.t("phonePlaceholder"))}" />
                  <p class="mfw-field-help" id="mfwPhoneHelp">${escapeHtml(this.t("phoneHelp"))}</p>
                  <p class="mfw-field-error" id="mfwPhoneError" aria-live="polite"></p>
                </div>

                <!-- Topic Dropdown (Synced with chips) -->
                <div class="mfw-form-group mfw-full-width">
                  <label class="mfw-label" for="mfwTopic">
                    <span id="mfwTopicLabel">${escapeHtml(this.t("topicLabel"))}</span>
                    <span class="mfw-required" aria-hidden="true">*</span>
                  </label>
                  <select id="mfwTopic" name="topic" class="mfw-select" required>
                    <option value="">${escapeHtml(this.t("topicPlaceholder"))}</option>
                  </select>
                  <p class="mfw-field-error" id="mfwTopicError" aria-live="polite"></p>
                </div>

                <!-- Name (Optional) -->
                <div class="mfw-form-group">
                  <label class="mfw-label" for="mfwName">
                    <span id="mfwNameLabel">${escapeHtml(this.t("nameLabel"))}</span>
                    <span class="mfw-optional" id="mfwNameOpt">${escapeHtml(this.t("optional"))}</span>
                  </label>
                  <input type="text" id="mfwName" name="name" class="mfw-input" maxlength="100" autocomplete="name" placeholder="${escapeHtml(this.t("namePlaceholder"))}" />
                  <p class="mfw-field-error" id="mfwNameError" aria-live="polite"></p>
                </div>

                <!-- Email (Optional) -->
                <div class="mfw-form-group">
                  <label class="mfw-label" for="mfwEmail">
                    <span id="mfwEmailLabel">${escapeHtml(this.t("emailLabel"))}</span>
                    <span class="mfw-optional" id="mfwEmailOpt">${escapeHtml(this.t("optional"))}</span>
                  </label>
                  <input type="email" id="mfwEmail" name="email" class="mfw-input" maxlength="254" autocomplete="email" placeholder="${escapeHtml(this.t("emailPlaceholder"))}" />
                  <p class="mfw-field-error" id="mfwEmailError" aria-live="polite"></p>
                </div>

                <!-- Message -->
                <div class="mfw-form-group mfw-full-width">
                  <div class="mfw-label-row">
                    <label class="mfw-label" for="mfwMessage">
                      <span id="mfwMessageLabel">${escapeHtml(this.t("messageLabel"))}</span>
                      <span class="mfw-required" aria-hidden="true">*</span>
                    </label>
                    <span id="mfwWordCount" class="mfw-word-count" aria-live="off">0 / 2,000 words</span>
                  </div>
                  <textarea id="mfwMessage" name="message" class="mfw-textarea" rows="4" required maxlength="30000" placeholder="${escapeHtml(this.t("messagePlaceholder"))}"></textarea>
                  <p class="mfw-field-help" id="mfwMessageHelp">${escapeHtml(this.t("messageHelp"))}</p>
                  <p class="mfw-field-error" id="mfwMessageError" aria-live="polite"></p>
                </div>

                <!-- Bot Honeypot -->
                <div class="mfw-hp" aria-hidden="true">
                  <label for="mfwWebsite">Website</label>
                  <input type="text" id="mfwWebsite" name="website" tabindex="-1" autocomplete="off" />
                </div>
              </div>

              <div class="mfw-banner-error" id="mfwFormError" role="alert" style="display: none;"></div>

              <button type="submit" class="mfw-submit-btn" id="mfwSubmitButton">
                <span id="mfwButtonText">${escapeHtml(this.t("submitBtn"))}</span>
                <span class="mfw-btn-arrow" aria-hidden="true">→</span>
              </button>

              <p class="mfw-footnote" id="mfwFootnote">${escapeHtml(this.t("footnote"))}</p>
            </form>

            <!-- Success State -->
            <div class="mfw-success-view" id="mfwSuccessView" style="display: none;" role="status">
              <div class="mfw-success-badge" aria-hidden="true">✓</div>
              <h3 class="mfw-success-title" id="mfwSuccessTitle">${escapeHtml(this.t("successTitle"))}</h3>
              <p class="mfw-success-subtitle" id="mfwSuccessSubtitle">${escapeHtml(this.t("successSubtitle"))}</p>

              <div class="mfw-ref-card">
                <span class="mfw-ref-label" id="mfwRefLabel">${escapeHtml(this.t("refLabel"))}</span>
                <div class="mfw-ref-number-row">
                  <span class="mfw-ref-code" id="mfwReferenceNumber">MF-2026-0000</span>
                  <button type="button" class="mfw-copy-btn" id="mfwCopyBtn">${escapeHtml(this.t("copyBtn"))}</button>
                </div>
              </div>

              <p class="mfw-success-note" id="mfwSuccessNote">${escapeHtml(this.t("successNotePhone"))}</p>

              <div class="mfw-btn-group">
                <button type="button" class="mfw-btn-outline" id="mfwNewMsgBtn">${escapeHtml(this.t("newMsgBtn"))}</button>
                <button type="button" class="mfw-btn-primary" id="mfwDoneBtn">${escapeHtml(this.t("doneBtn"))}</button>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(root);
      this.root = root;

      // Handle teaser visibility
      if (!config.showTeaser || sessionStorage.getItem("mfw_teaser_dismissed") === "1") {
        const teaser = document.getElementById("mfwTeaser");
        if (teaser) teaser.style.display = "none";
      }
    }

    bindEvents() {
      const launcher = document.getElementById("mfwLauncher");
      const backdrop = document.getElementById("mfwBackdrop");
      const closeBtn = document.getElementById("mfwCloseBtn");
      const form = document.getElementById("mfwForm");
      const doneBtn = document.getElementById("mfwDoneBtn");
      const newMsgBtn = document.getElementById("mfwNewMsgBtn");
      const copyBtn = document.getElementById("mfwCopyBtn");
      const teaser = document.getElementById("mfwTeaser");
      const teaserClose = document.getElementById("mfwTeaserClose");

      launcher.addEventListener("click", () => this.toggle());
      backdrop.addEventListener("click", () => this.close());
      closeBtn.addEventListener("click", () => this.close());
      doneBtn.addEventListener("click", () => this.close());

      if (teaser) {
        teaser.addEventListener("click", (e) => {
          if (e.target !== teaserClose) {
            this.open();
          }
        });
      }
      if (teaserClose) {
        teaserClose.addEventListener("click", (e) => {
          e.stopPropagation();
          teaser.style.opacity = "0";
          setTimeout(() => (teaser.style.display = "none"), 250);
          sessionStorage.setItem("mfw_teaser_dismissed", "1");
        });
      }

      // Language Switcher buttons
      const langBtns = this.root.querySelectorAll(".mfw-lang-btn");
      langBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const targetLang = btn.getAttribute("data-lang");
          this.setLanguage(targetLang);
        });
      });

      // Escape key to close
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen) {
          this.close();
        }
      });

      // Form validation & live word count
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

      topicSelect.addEventListener("change", (e) => {
        this.selectedTopicCode = e.target.value;
        this.highlightTopicChip(e.target.value);
        this.validateField("topic");
      });

      form.addEventListener("submit", (e) => this.handleSubmit(e));
      newMsgBtn.addEventListener("click", () => this.resetForm());

      copyBtn.addEventListener("click", () => {
        const ref = document.getElementById("mfwReferenceNumber").textContent;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(ref).then(() => {
            copyBtn.textContent = this.t("copiedBtn");
            setTimeout(() => (copyBtn.textContent = this.t("copyBtn")), 2000);
          });
        }
      });
    }

    setLanguage(langCode) {
      if (!I18N[langCode]) return;
      currentLang = langCode;

      // Update active button state
      const langBtns = this.root.querySelectorAll(".mfw-lang-btn");
      langBtns.forEach((btn) => {
        btn.classList.toggle("mfw-lang-active", btn.getAttribute("data-lang") === langCode);
      });

      // Update text nodes across the UI
      document.getElementById("mfwLauncherTop").textContent = this.t("launcherTop");
      document.getElementById("mfwLauncherTarget").textContent = this.t("launcherTarget");
      document.getElementById("mfwTeaserText").textContent = this.t("teaserText");

      document.getElementById("mfwEyebrow").textContent = this.t("headerEyebrow");
      document.getElementById("mfwPanelTitle").textContent = this.t("headerTitle");
      document.getElementById("mfwHeaderStatus").textContent = this.t("headerStatus");

      document.getElementById("mfwBubbleTitle").textContent = this.t("chatBubbleTitle");
      document.getElementById("mfwBubbleText").textContent = this.t("chatBubbleText");
      document.getElementById("mfwTopicChipsLabel").textContent = this.t("topicChipsLabel");

      document.getElementById("mfwPhoneLabel").textContent = this.t("phoneLabel");
      document.getElementById("mfwPhoneHelp").textContent = this.t("phoneHelp");
      document.getElementById("mfwPhone").placeholder = this.t("phonePlaceholder");

      document.getElementById("mfwTopicLabel").textContent = this.t("topicLabel");
      document.getElementById("mfwNameLabel").textContent = this.t("nameLabel");
      document.getElementById("mfwNameOpt").textContent = this.t("optional");
      document.getElementById("mfwName").placeholder = this.t("namePlaceholder");

      document.getElementById("mfwEmailLabel").textContent = this.t("emailLabel");
      document.getElementById("mfwEmailOpt").textContent = this.t("optional");
      document.getElementById("mfwEmail").placeholder = this.t("emailPlaceholder");

      document.getElementById("mfwMessageLabel").textContent = this.t("messageLabel");
      document.getElementById("mfwMessageHelp").textContent = this.t("messageHelp");
      document.getElementById("mfwMessage").placeholder = this.t("messagePlaceholder");

      document.getElementById("mfwButtonText").textContent = this.t("submitBtn");
      document.getElementById("mfwFootnote").textContent = this.t("footnote");

      document.getElementById("mfwSuccessTitle").textContent = this.t("successTitle");
      document.getElementById("mfwSuccessSubtitle").textContent = this.t("successSubtitle");
      document.getElementById("mfwRefLabel").textContent = this.t("refLabel");
      document.getElementById("mfwCopyBtn").textContent = this.t("copyBtn");
      document.getElementById("mfwNewMsgBtn").textContent = this.t("newMsgBtn");
      document.getElementById("mfwDoneBtn").textContent = this.t("doneBtn");

      // Re-render topic chips & dropdown with translated labels
      this.renderTopicOptions();
      this.updateWordCount();
    }

    renderTopicOptions() {
      const topicSelect = document.getElementById("mfwTopic");
      const chipsContainer = document.getElementById("mfwTopicChips");
      const currentSelected = this.selectedTopicCode || topicSelect.value;

      // Select Dropdown
      topicSelect.innerHTML = `<option value="">${escapeHtml(this.t("topicPlaceholder"))}</option>`;
      this.topics.forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t.code;
        opt.textContent = this.getTopicLabel(t.code, t.label);
        if (t.code === currentSelected) opt.selected = true;
        topicSelect.appendChild(opt);
      });

      // Topic Chips
      chipsContainer.innerHTML = "";
      this.topics.forEach((t) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "mfw-chip" + (t.code === currentSelected ? " mfw-chip-active" : "");
        chip.setAttribute("data-topic", t.code);
        chip.textContent = this.getTopicLabel(t.code, t.label);

        chip.addEventListener("click", () => {
          this.selectedTopicCode = t.code;
          topicSelect.value = t.code;
          this.highlightTopicChip(t.code);
          this.validateField("topic");
        });

        chipsContainer.appendChild(chip);
      });
    }

    getTopicLabel(code, defaultFallback) {
      const dict = I18N[currentLang] || I18N.en;
      if (dict.topics && dict.topics[code]) {
        return dict.topics[code];
      }
      return defaultFallback || code;
    }

    highlightTopicChip(topicCode) {
      const chips = this.root.querySelectorAll(".mfw-chip");
      chips.forEach((c) => {
        c.classList.toggle("mfw-chip-active", c.getAttribute("data-topic") === topicCode);
      });
    }

    open() {
      this.isOpen = true;
      this.root.classList.add("mfw-open");
      const launcher = document.getElementById("mfwLauncher");
      const panel = document.getElementById("mfwPanel");
      launcher.setAttribute("aria-expanded", "true");
      panel.setAttribute("aria-hidden", "false");

      // Hide greeting teaser once opened
      const teaser = document.getElementById("mfwTeaser");
      if (teaser) teaser.style.display = "none";

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
      try {
        const res = await fetch(config.apiBase + "topics.php", {
          headers: { Accept: "application/json" },
        });
        const data = await res.json();
        if (res.ok && data.ok && Array.isArray(data.topics) && data.topics.length > 0) {
          this.topics = data.topics;
          if (data.max_words) this.maxWords = data.max_words;
        } else {
          this.fallbackTopics();
        }
      } catch (err) {
        this.fallbackTopics();
      }

      this.renderTopicOptions();
      this.updateWordCount();
    }

    fallbackTopics() {
      this.topics = TOPIC_KEYS.map((k) => ({
        code: k,
        label: I18N.en.topics[k] || k,
      }));
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
          this.setError("mfwEmail", "mfwEmailError", this.t("errEmail"));
          return false;
        }
        this.clearError("mfwEmail", "mfwEmailError");
        return true;
      }

      if (name === "phone") {
        const val = document.getElementById("mfwPhone").value.trim();
        const digits = (val.match(/\d/g) || []).length;
        if (!val) {
          this.setError("mfwPhone", "mfwPhoneError", this.t("errPhoneReq"));
          return false;
        }
        if (!/^\+?[0-9\s\-()]{7,25}$/.test(val) || digits < 7 || digits > 15) {
          this.setError("mfwPhone", "mfwPhoneError", this.t("errPhoneInvalid"));
          return false;
        }
        this.clearError("mfwPhone", "mfwPhoneError");
        return true;
      }

      if (name === "topic") {
        const val = document.getElementById("mfwTopic").value;
        if (!val) {
          this.setError("mfwTopic", "mfwTopicError", this.t("errTopicReq"));
          return false;
        }
        this.clearError("mfwTopic", "mfwTopicError");
        return true;
      }

      if (name === "message") {
        const val = document.getElementById("mfwMessage").value;
        const words = countWords(val);
        if (!val.trim()) {
          this.setError("mfwMessage", "mfwMessageError", this.t("errMessageReq"));
          return false;
        }
        if (words > this.maxWords) {
          this.setError(
            "mfwMessage",
            "mfwMessageError",
            `${this.t("errMessageLimit")} (${fmt(words)} / ${fmt(this.maxWords)})`
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
      btnText.textContent = isSubmitting ? this.t("submitting") : this.t("submitBtn");
    }

    async handleSubmit(e) {
      e.preventDefault();
      const formError = document.getElementById("mfwFormError");
      formError.style.display = "none";
      formError.textContent = "";

      const isPhoneValid = this.validateField("phone");
      const isTopicValid = this.validateField("topic");
      const isMessageValid = this.validateField("message");
      const isEmailValid = this.validateField("email");

      if (!isPhoneValid || !isTopicValid || !isMessageValid || !isEmailValid) {
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
        website: document.getElementById("mfwWebsite").value,
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
        formError.textContent = this.t("errNetwork");
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

      refEl.textContent = data.reference || "MF-" + Math.floor(100000 + Math.random() * 900000);

      if (data.email === "sent" && userEmail) {
        noteEl.textContent = this.t("successNoteEmail");
      } else {
        noteEl.textContent = this.t("successNotePhone");
      }

      form.style.display = "none";
      successView.style.display = "flex";
    }

    resetForm() {
      const form = document.getElementById("mfwForm");
      const successView = document.getElementById("mfwSuccessView");
      const formError = document.getElementById("mfwFormError");

      form.reset();
      this.selectedTopicCode = "";
      this.highlightTopicChip("");
      ["mfwName", "mfwEmail", "mfwPhone", "mfwTopic", "mfwMessage"].forEach((id) => {
        this.clearError(id, id + "Error");
      });
      formError.style.display = "none";
      this.updateWordCount();

      successView.style.display = "none";
      form.style.display = "block";
      document.getElementById("mfwPhone").focus();
    }
  }

  // Initialize
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
