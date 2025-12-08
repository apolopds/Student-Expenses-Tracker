let currentUser = null;
let expenses = [];

// AUTO-LOGIN IF SAVED
if (localStorage.getItem("currentUser")) {
  currentUser = JSON.parse(localStorage.getItem("currentUser"));
  expenses = JSON.parse(localStorage.getItem("expenses") || "[]");
  showDashboard();
}

/* ---------------- AUTH ---------------- */

function showRegister() {
  document.querySelector(".login-form").classList.add("hidden");
  document.querySelector(".register-form").classList.remove("hidden");
}

function showLogin() {
  document.querySelector(".register-form").classList.add("hidden");
  document.querySelector(".login-form").classList.remove("hidden");
}

function register() {
  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const errorDiv = document.getElementById("register-error");

  errorDiv.style.display = "none";

  if (!name || !email || !password) {
    errorDiv.textContent = "Please fill in all fields.";
    errorDiv.style.display = "block";
    return;
  }

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const existingUser = users.find((u) => u.email === email);

  if (existingUser) {
    errorDiv.textContent = "Email already registered.";
    errorDiv.style.display = "block";
    return;
  }

  users.push({ name, email, password });
  localStorage.setItem("users", JSON.stringify(users));

  document.getElementById("register-modal").style.display = "block";
  setTimeout(() => {
    document.getElementById("register-modal").style.display = "none";
    showLogin();
  }, 2000);
}

function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const errorDiv = document.getElementById("login-error");

  errorDiv.style.display = "none";

  if (!email || !password) {
    errorDiv.textContent = "Please fill in all fields.";
    errorDiv.style.display = "block";
    return;
  }

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    expenses = JSON.parse(localStorage.getItem("expenses") || "[]");

    document.getElementById("login-modal").style.display = "block";
    setTimeout(() => {
      document.getElementById("login-modal").style.display = "none";
      showDashboard();
    }, 4000);
  } else {
    errorDiv.textContent = "Invalid email or password.";
    errorDiv.style.display = "block";
  }
}

/* ---------------- PAGE SWITCH SYSTEM ---------------- */

function hideAllSections() {
  document.getElementById("dashboard-content").classList.add("hidden");
  document.getElementById("add-expenses-content").classList.add("hidden");
  document.getElementById("profile-content").classList.add("hidden");
  document.getElementById("history-content").classList.add("hidden");
  document.getElementById("team-content").classList.add("hidden");
}

function showTeam() {
  hideAllSections();
  document.getElementById("team-content").classList.remove("hidden");
}

function showDashboard() {
  hideAllSections();
  document.getElementById("login-page").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  document.getElementById("dashboard-content").classList.remove("hidden");

  document.getElementById(
    "greeting"
  ).textContent = `Everyone Welcome, ${currentUser.name}!`;

  updateSummary();
}

function showAddExpenses() {
  hideAllSections();
  document.getElementById("add-expenses-content").classList.remove("hidden");
}

function showProfile() {
  hideAllSections();
  document.getElementById("profile-content").classList.remove("hidden");

  document.getElementById("profile-name-input").value = currentUser.name;
  document.getElementById("profile-email-input").value = currentUser.email;

  const profileModal = document.getElementById("profile-modal");
  const profileModalMessage = document.getElementById("profile-modal-message");
  const profileModalIcon = document.getElementById("profile-modal-icon");

  function showProfileModal(message, isSuccess = true) {
    profileModalMessage.textContent = message;

    if (isSuccess) {
      profileModalIcon.className = "fas fa-check-circle success-icon";
      profileModalIcon.style.color = "#28a745";
    } else {
      profileModalIcon.className = "fas fa-exclamation-circle success-icon";
      profileModalIcon.style.color = "#dc3545";
    }

    profileModal.classList.remove("hidden");

    setTimeout(() => {
      profileModal.classList.add("hidden");
    }, 2000);
  }

  document.getElementById("save-profile").onclick = function () {
    const newName = document.getElementById("profile-name-input").value.trim();

    if (newName) {
      currentUser.name = newName;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      document.getElementById(
        "greeting"
      ).textContent = `Hello ${currentUser.name}`;

      showProfileModal("Profile updated successfully!", true);
    } else {
      showProfileModal("Name cannot be empty.", false);
    }
  };
}

function showHistory() {
  hideAllSections();
  document.getElementById("history-content").classList.remove("hidden");
  loadHistoryList();
}

/* ---------------- ADD EXPENSE ---------------- */

function addExpense() {
  const description = document.getElementById("expense-description").value;
  const amount = parseFloat(document.getElementById("expense-amount").value);
  const category = document.getElementById("expense-category").value;
  const date = document.getElementById("expense-date").value;

  if (description && amount && date) {
    expenses.push({ description, amount, category, date });
    localStorage.setItem("expenses", JSON.stringify(expenses));
    updateSummary();
    showDashboard();
  }
}

/* ---------------- DELETE EXPENSE ---------------- */

function deleteExpense(index) {
  expenses.splice(index, 1);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  updateSummary();
  loadHistoryList();
}

/* ---------------- SUMMARY + RECENT EXPENSES ---------------- */

function updateSummary() {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  let daily = 0,
    weekly = 0,
    monthly = 0;

  expenses.forEach((exp) => {
    if (exp.date >= today) daily += exp.amount;
    if (exp.date >= weekAgo) weekly += exp.amount;
    if (exp.date >= monthAgo) monthly += exp.amount;
  });

  document.getElementById("daily-spent").textContent = `₱${daily.toFixed(2)}`;
  document.getElementById("weekly-spent").textContent = `₱${weekly.toFixed(2)}`;
  document.getElementById("monthly-spent").textContent = `₱${monthly.toFixed(
    2
  )}`;

  const list = document.getElementById("expense-list");
  list.innerHTML = "";

  expenses.slice(-5).forEach((exp, i) => {
    const trueIndex = expenses.length - 5 + i;

    const item = document.createElement("div");
    item.className = "expense-item";

    item.innerHTML = `
      <span>${exp.description} (${exp.category})</span>
      <span>₱${exp.amount} - ${exp.date}</span>
      <button class="delete-expense-btn" onclick="deleteExpense(${trueIndex})">
        Remove
      </button>
    `;

    list.appendChild(item);
  });
}

/* ---------------- LOGOUT ---------------- */

function logout() {
  document.getElementById("logout-modal").style.display = "block";

  localStorage.removeItem("currentUser");
  currentUser = null;
  expenses = [];

  setTimeout(() => {
    document.getElementById("logout-modal").style.display = "none";
    document.getElementById("dashboard").classList.add("hidden");
    document.getElementById("login-page").classList.remove("hidden");
  }, 4000);
}

/* ---------------- HISTORY PAGE ---------------- */

function loadHistoryList() {
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  const search = document.getElementById("search-expense").value.toLowerCase();
  const sortOption = document.getElementById("sort-expense").value;

  // SEARCH FILTER
  expenses = expenses.filter(
    (exp) =>
      exp.description.toLowerCase().includes(search) ||
      exp.category.toLowerCase().includes(search)
  );

  // SORTING
  switch (sortOption) {
    case "date-desc":
      expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case "date-asc":
      expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case "amount-desc":
      expenses.sort((a, b) => b.amount - a.amount);
      break;
    case "amount-asc":
      expenses.sort((a, b) => a.amount - b.amount);
      break;
  }

  const historyList = document.getElementById("history-list");
  historyList.innerHTML = "";

  if (expenses.length === 0) {
    historyList.innerHTML = `<p style="color:#bbb;">No expenses found.</p>`;
    return;
  }

  // RENDER ITEMS
  expenses.forEach((exp, index) => {
    const item = document.createElement("div");
    item.classList.add("history-item");

    item.innerHTML = `
      <div class="history-left">
        ${exp.description} (${exp.category})
      </div>

      <div class="history-center">
        ₱${exp.amount.toFixed(2)}
      </div>

      <div class="history-center">
        ${exp.date}
      </div>

      <div class="history-right">
        <button class="history-remove-btn" onclick="deleteExpense(${index}); loadHistoryList();">
          Remove
        </button>
      </div>
    `;

    historyList.appendChild(item);
  });
}

document
  .getElementById("search-expense")
  ?.addEventListener("input", loadHistoryList);
document
  .getElementById("sort-expense")
  ?.addEventListener("change", loadHistoryList);

function updateDashboardTime() {
  const now = new Date();
  const options = {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  document.getElementById("dash-time").textContent = now.toLocaleString(
    "en-US",
    options
  );
}

setInterval(updateDashboardTime, 1000);
updateDashboardTime();
