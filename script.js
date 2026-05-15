let activities = [];

function openModal() {
  document.getElementById("modal").style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  clearForm();
}

function saveActivity() {
  const category = document.getElementById("category").value;
  const content = document.getElementById("content").value;
  const address = document.getElementById("address").value;
  const weather = document.getElementById("weather").value;
  const author = document.getElementById("author").value;

  if (category === "" || content === "" || author === "") {
    alert("Bitte Kategorie, Inhalt und Person ausfüllen.");
    return;
  }

  const newActivity = {
    id: Date.now(),
    category: category,
    content: content,
    address: address,
    weather: weather,
    author: author,
    date: new Date()
  };

  activities.push(newActivity);

  closeModal();
  renderTable();
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
      <td>${activity.address}</td>
      <td>${activity.weather}</td>
      <td>${activity.author}</td>
      <td>${activity.date.toLocaleDateString("de-DE")}</td>
      <td>
        <button class="delete-btn" onclick="deleteActivity(${activity.id})">
          Löschen
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

function deleteActivity(id) {
  activities = activities.filter(activity => activity.id !== id);
  renderTable();
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