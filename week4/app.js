const places = [
  { id: "library", query: "FQPX+PWX 부천시 경기도" },
  { id: "playground", query: "FRQ2+587 부천시 경기도" },
  { id: "chapel", query: "FRM3+W5X 부천시 경기도" },
];

const buttons = document.querySelectorAll(".place-btn");
const panels = document.querySelectorAll(".place-panel");
const map = document.querySelector("#map");

function showPlace(id) {
  for (const panel of panels) {
    panel.hidden = panel.id !== id;
  }

  for (const button of buttons) {
    const isSelected = button.dataset.place === id;
    button.setAttribute("aria-pressed", isSelected ? "true" : "false");
  }

  const place = places.find(function (p) {
    return p.id === id;
  });
  if (place) {
    map.src =
      "https://www.google.com/maps?q=" +
      encodeURIComponent(place.query) +
      "&output=embed";
  }
}

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    showPlace(button.dataset.place);
  });
});

showPlace(places[0].id);