/* =========================================================
   Wollega University | CS Department Hub
   script.js
   Handles: mobile nav toggle, course filtering, and
   Study Group Finder form validation.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  setYear();
  initNavToggle();
  initCourseFilter();
  initStudyForm();
});

/* ---------------------------------------------------------
   Footer year
--------------------------------------------------------- */
function setYear() {
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* ---------------------------------------------------------
   Mobile navigation toggle
--------------------------------------------------------- */
function initNavToggle() {
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("primaryNav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    var isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close the mobile menu once a link is chosen, and mark it active.
  nav.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      nav.querySelectorAll(".nav-link").forEach(function (l) {
        l.classList.remove("is-active");
      });
      link.classList.add("is-active");
    });
  });
}

/* ---------------------------------------------------------
   Course grid filtering (All / 3rd Year / 4th Year)
--------------------------------------------------------- */
function initCourseFilter() {
  var filterButtons = document.querySelectorAll(".filter-btn");
  var courseCards = document.querySelectorAll(".course-card");
  var statusEl = document.getElementById("filterStatus");
  var emptyState = document.getElementById("emptyState");

  if (!filterButtons.length) return;

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filterValue = button.getAttribute("data-filter");

      // Update active tab styling.
      filterButtons.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      button.classList.add("is-active");
      button.setAttribute("aria-pressed", "true");

      // Show/hide matching cards.
      var visibleCount = 0;
      courseCards.forEach(function (card) {
        var matches = filterValue === "all" || card.getAttribute("data-year") === filterValue;
        card.hidden = !matches;
        if (matches) visibleCount++;
      });

      // Update the live status line for screen readers and sighted users.
      if (statusEl) {
        var label = filterValue === "all" ? "all" : filterValue === "year3" ? "3rd Year" : "4th Year";
        statusEl.textContent = "Showing " + (filterValue === "all" ? visibleCount + " courses" : visibleCount + " " + label + " courses");
      }

      // Toggle the empty-state message.
      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    });
  });
}

/* ---------------------------------------------------------
   Study Group Finder — form validation
--------------------------------------------------------- */
function initStudyForm() {
  var form = document.getElementById("studyForm");
  if (!form) return;

  var feedback = document.getElementById("formFeedback");

  // Student ID pattern, e.g. WU/1234/15 — 2-3 letters, slash,
  // 3-6 digits, slash, 2-digit year.
  var STUDENT_ID_PATTERN = /^[A-Za-z]{2,3}\/\d{3,6}\/\d{2}$/;

  var fields = {
    fullName: {
      input: document.getElementById("fullName"),
      errorEl: document.getElementById("fullNameError"),
      validate: function (value) {
        if (value.trim().length === 0) return "Enter your full name.";
        if (value.trim().length < 3) return "Name looks too short — enter your full name.";
        return "";
      }
    },
    studentId: {
      input: document.getElementById("studentId"),
      errorEl: document.getElementById("studentIdError"),
      validate: function (value) {
        if (value.trim().length === 0) return "Enter your student ID.";
        if (!STUDENT_ID_PATTERN.test(value.trim())) {
          return "Use the format WU/1234/15 (letters / digits / 2-digit year).";
        }
        return "";
      }
    },
    majorYear: {
      input: document.getElementById("majorYear"),
      errorEl: document.getElementById("majorYearError"),
      validate: function (value) {
        if (!value) return "Select your major and year.";
        return "";
      }
    },
    studyTopic: {
      input: document.getElementById("studyTopic"),
      errorEl: document.getElementById("studyTopicError"),
      validate: function (value) {
        if (value.trim().length === 0) return "Tell us the topic you'd like to study.";
        return "";
      }
    },
    contact: {
      input: document.getElementById("contact"),
      errorEl: document.getElementById("contactError"),
      validate: function (value) {
        var trimmed = value.trim();
        if (trimmed.length === 0) return ""; // optional field
        var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        var PHONE_PATTERN = /^(09|07)\d{8}$/; // Ethiopian mobile format, e.g. 0925769787
        var isEmail = EMAIL_PATTERN.test(trimmed);
        var isPhone = PHONE_PATTERN.test(trimmed.replace(/\s|-/g, ""));
        if (!isEmail && !isPhone) {
          return "Enter a valid email (name@example.com) or phone number (e.g. 0925769787).";
        }
        return "";
      }
    }
  };

  // Validate a single field and reflect the result in the UI.
  function validateField(key) {
    var field = fields[key];
    if (!field.input) return true;
    var message = field.validate(field.input.value);
    var row = field.input.closest(".form-row");

    if (message) {
      row.classList.add("has-error");
      field.errorEl.textContent = message;
      return false;
    }
    row.classList.remove("has-error");
    field.errorEl.textContent = "";
    return true;
  }

  // Validate on blur so students get feedback before submitting.
  Object.keys(fields).forEach(function (key) {
    var input = fields[key].input;
    if (!input) return;
    input.addEventListener("blur", function () {
      validateField(key);
    });
    input.addEventListener("input", function () {
      // Clear the error as soon as the field looks valid again.
      var row = input.closest(".form-row");
      if (row.classList.contains("has-error")) {
        validateField(key);
      }
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var isFormValid = true;
    Object.keys(fields).forEach(function (key) {
      var fieldIsValid = validateField(key);
      if (!fieldIsValid) isFormValid = false;
    });

    if (!isFormValid) {
      showFeedback("Please fix the highlighted fields and try again.", "error");
      // Move focus to the first invalid field for keyboard/screen-reader users.
      var firstErrorRow = form.querySelector(".form-row.has-error input, .form-row.has-error select");
      if (firstErrorRow) firstErrorRow.focus();
      return;
    }

    // All good — in a real deployment this is where the data would be
    // sent to the department's backend/API. Here we simulate success.
    var name = fields.fullName.input.value.trim();
    showFeedback(
      "Thanks, " + name + "! You're registered. We'll email or text you when we find a matching study group.",
      "success"
    );
    form.reset();
    Object.keys(fields).forEach(function (key) {
      var row = fields[key].input && fields[key].input.closest(".form-row");
      if (row) row.classList.remove("has-error");
    });
  });

  function showFeedback(message, type) {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.classList.remove("is-success", "is-error");
    feedback.classList.add(type === "success" ? "is-success" : "is-error");
    feedback.focus && feedback.setAttribute("tabindex", "-1");
    feedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}
