let activities = [];

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

function openModal() {
  document.getElementById("modal").style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  clearForm();
}

async function saveActivity() {

  const category =
    document.getElementById("category").value;

  const content =
    document.getElementById("content").value;

  const address =
    document.getElementById("address").value;

  const weather =
    document.getElementById("weather").value;

  const author =
    document.getElementById("author").value;

  if (
    category === "" ||
    content === "" ||
    author === ""
  ) {
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

  const tableBody =
    document.getElementById(
      "activityTableBody"
    );

  tableBody.innerHTML = "";

  let filteredActivities =
    [...activities];

  const selectedCategories =
    getCheckedValues("filterCategory");

  const selectedWeather =
    getCheckedValues("filterWeather");

  const selectedAuthors =
    getCheckedValues("filterAuthor");

  if (selectedCategories.length > 0) {
    filteredActivities =
      filteredActivities.filter(activity =>
        selectedCategories.includes(
          activity.category
        )
      );
  }

  if (selectedWeather.length > 0) {
    filteredActivities =
      filteredActivities.filter(activity =>
        selectedWeather.includes(
          activity.weather
        )
      );
  }

  if (selectedAuthors.length > 0) {
    filteredActivities =
      filteredActivities.filter(activity =>
        selectedAuthors.includes(
          activity.author
        )
      );
  }

  filteredActivities.forEach(activity => {

    const row =
      document.createElement("tr");

    row.innerHTML = `
      <td>${activity.category}</td>
      <td>${activity.content}</td>
      <td>${activity.address || ""}</td>
      <td>${activity.weather}</td>
      <td>${activity.author}</td>

      <td>
        ${new Date(
          activity.created_at
        ).toLocaleDateString("de-DE")}
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

  const checkboxes =
    document.querySelectorAll(
      `input[name="${name}"]:checked`
    );

  return Array.from(checkboxes)
    .map(checkbox => checkbox.value);
}

function resetFilters() {

  document
    .querySelectorAll(
      ".filters input[type='checkbox']"
    )
    .forEach(checkbox => {
      checkbox.checked = false;
    });

  renderTable();
}

function clearForm() {

  document.getElementById("category").value = "";

  document.getElementById("content").value = "";

  document.getElementById("address").value = "";

  document.getElementById("weather").value =
    "Wetter egal";

  document.getElementById("author").value = "";
}

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