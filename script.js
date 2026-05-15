function addActivity() {

  const input = document.getElementById("activityInput");

  const text = input.value;

  if (text === "") return;

  const li = document.createElement("li");

  const span = document.createElement("span");
  span.textContent = text;

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "❌";

  deleteButton.onclick = function () {
    li.remove();
  };

  li.appendChild(span);
  li.appendChild(deleteButton);

  document.getElementById("activityList").appendChild(li);

  input.value = "";
}