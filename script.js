const APP_PASSWORD = "777";

function checkPassword() {

  const input =
    document.getElementById("passwordInput").value;

  if (input === APP_PASSWORD) {

    document.getElementById("loginScreen").style.display =
      "none";

    document.getElementById("appContent").style.display =
      "block";

    localStorage.setItem("isLoggedIn", "true");

  } else {

    document.getElementById("loginError").textContent = "";
  }
}

if (localStorage.getItem("isLoggedIn") === "true") {
  window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("appContent").style.display = "block";
  });
}
let activities = [];
let categories = [];

async function loadActivities() {
  const { data, error } =
    await window.supabaseClient
      .from("activities")
      .select("*")
      .order("created_at", {
        ascending: false
      });

  if (error) {
    console.error(error);
    return;
  }

  activities = data;
  renderTable();
}

async function loadCategories() {
  const { data, error } =
    await window.supabaseClient
      .from("categories")
      .select("*")
      .order("name", {
        ascending: true
      });

  if (error) {
    console.error(error);
    return;
  }

  categories = data;

  renderCategorySelects();
  renderCategoryFilters();
  renderCategoryList();
}

function openModal() {
  document.getElementById("modal").style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  clearForm();
}

async function saveActivity() {
  const category = document.getElementById("category").value;
  const content = document.getElementById("content").value;
  const address = document.getElementById("address").value;
  const weather = document.getElementById("weather").value;
  const author = document.getElementById("author").value;

  if (category === "" || content === "" || author === "") {
    alert("Bitte Pflichtfelder ausfüllen");
    return;
  }

  const { error } =
    await window.supabaseClient
      .from("activities")
      .insert([
        {
          category,
          content,
          address,
          weather,
          author
        }
      ]);

  if (error) {
    console.error(error);
    alert("Fehler beim Speichern");
    return;
  }

  closeModal();
  loadActivities();
}

function renderTable() {
  const tableBody = document.getElementById("activityTableBody");
  tableBody.innerHTML = "";

  let filteredActivities = [...activities];

  const selectedCategories = getCheckedValues("filterCategory");
  const selectedWeather = getCheckedValues("filterWeather");
  const selectedAuthors = getCheckedValues("filterAuthor");

  if (selectedCategories.length > 0) {
    filteredActivities = filteredActivities.filter(activity =>
      selectedCategories.includes(activity.category)
    );
  }

  if (selectedWeather.length > 0) {
    filteredActivities = filteredActivities.filter(activity =>
      selectedWeather.includes(activity.weather)
    );
  }

  if (selectedAuthors.length > 0) {
    filteredActivities = filteredActivities.filter(activity =>
      selectedAuthors.includes(activity.author)
    );
  }

  filteredActivities.forEach(activity => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${activity.category}</td>

      <td>${activity.content}</td>

      <td>
        ${
          activity.address
            ? `<a 
                href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.address)}"
                target="_blank"
              >
                ${activity.address}
              </a>`
            : ""
        }
      </td>

      <td>${activity.weather}</td>

      <td>${activity.author}</td>

      <td>
        ${new Date(activity.created_at).toLocaleDateString("de-DE")}
      </td>

      <td>
        <button
          class="delete-btn"
          onclick="deleteActivity(${activity.id})"
        >
          Löschen
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

async function deleteActivity(id) {
  await window.supabaseClient
    .from("activities")
    .delete()
    .eq("id", id);

  loadActivities();
}

function getCheckedValues(name) {
  const checkboxes = document.querySelectorAll(
    `input[name="${name}"]:checked`
  );

  return Array.from(checkboxes).map(checkbox => checkbox.value);
}

function resetFilters() {
  document
    .querySelectorAll(".filters input[type='checkbox']")
    .forEach(checkbox => {
      checkbox.checked = false;
    });

  renderTable();
}

function clearForm() {
  document.getElementById("category").value = "";
  document.getElementById("content").value = "";
  document.getElementById("address").value = "";
  document.getElementById("weather").value = "Wetter egal";
  document.getElementById("author").value = "";
}

function renderCategorySelects() {
  const categorySelect = document.getElementById("category");

  categorySelect.innerHTML =
    `<option value="">Kategorie wählen</option>`;

  categories.forEach(category => {
    categorySelect.innerHTML += `
      <option>${category.name}</option>
    `;
  });
}

function renderCategoryFilters() {
  const categoryFilter =
    document.getElementById("categoryFilterContent");

  if (!categoryFilter) return;

  categoryFilter.innerHTML = "";

  categories.forEach(category => {
    categoryFilter.innerHTML += `
      <label>
        <input
          type="checkbox"
          name="filterCategory"
          value="${category.name}"
          onchange="renderTable()"
        >
        ${category.name}
      </label>
    `;
  });
}

function openCategoryModal() {
  document.getElementById("categoryModal").style.display = "block";
  renderCategoryList();
}

function closeCategoryModal() {
  document.getElementById("categoryModal").style.display = "none";
  document.getElementById("newCategoryName").value = "";
}

function renderCategoryList() {
  const categoryList = document.getElementById("categoryList");

  if (!categoryList) return;

  categoryList.innerHTML = "";

  categories.forEach(category => {
    const isProtected = category.name === "Sonstiges";

    categoryList.innerHTML += `
      <div class="category-item">
        <strong>${category.name}</strong>

        <button
          class="category-delete-btn"
          ${isProtected ? "disabled" : ""}
          onclick="deleteCategory('${category.name}')"
        >
          Löschen
        </button>
      </div>
    `;
  });
}

async function addCategory() {
  const input = document.getElementById("newCategoryName");
  const name = input.value.trim();

  if (name === "") {
    alert("Bitte Kategorienamen eingeben.");
    return;
  }

  const alreadyExists = categories.some(category =>
    category.name.toLowerCase() === name.toLowerCase()
  );

  if (alreadyExists) {
    alert("Diese Kategorie gibt es bereits.");
    return;
  }

  const { error } =
    await window.supabaseClient
      .from("categories")
      .insert([
        {
          name: name
        }
      ]);

  if (error) {
    console.error(error);
    alert("Kategorie konnte nicht gespeichert werden.");
    return;
  }

  input.value = "";
  loadCategories();
}

async function deleteCategory(categoryName) {
  if (categoryName === "Sonstiges") {
    alert("Die Kategorie Sonstiges kann nicht gelöscht werden.");
    return;
  }

  const confirmed = confirm(
    `Kategorie "${categoryName}" löschen? Bestehende Einträge werden auf "Sonstiges" geändert.`
  );

  if (!confirmed) return;

  const updateResult =
    await window.supabaseClient
      .from("activities")
      .update({
        category: "Sonstiges"
      })
      .eq("category", categoryName);

  if (updateResult.error) {
    console.error(updateResult.error);
    alert("Einträge konnten nicht auf Sonstiges geändert werden.");
    return;
  }

  const deleteResult =
    await window.supabaseClient
      .from("categories")
      .delete()
      .eq("name", categoryName);

  if (deleteResult.error) {
    console.error(deleteResult.error);
    alert("Kategorie konnte nicht gelöscht werden.");
    return;
  }

  await loadCategories();
  await loadActivities();
}

loadCategories();
loadActivities();

const channel = window.supabaseClient
  .channel("activities-realtime")

  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "activities"
    },
    payload => {
      console.log("Realtime Update", payload);
      loadActivities();
    }
  )

  .subscribe(status => {
    console.log("Realtime Status:", status);
  });