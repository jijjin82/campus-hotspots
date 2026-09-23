// 세 장소의 정보. Plus Code(전 세계 고유 위치 코드)를 사용해
// "성심교정/성의교정" 같은 이름 혼동을 원천 차단합니다.
const places = [
  { id: "library", query: "FQPX+PWX 부천시 경기도" },
  { id: "playground", query: "FRQ2+587 부천시 경기도" },
  { id: "chapel", query: "FRM3+W5X 부천시 경기도" },
];

const buttons = document.querySelectorAll(".place-btn");
const panels = document.querySelectorAll(".place-panel");
const map = document.querySelector("#map");

// id에 해당하는 장소만 보이게 하고, 버튼 선택 상태와 지도를 함께 갱신합니다.
function showPlace(id) {
  // 1) 설명 section: 클릭한 id와 같은 것만 보이고 나머지는 숨김
  for (const panel of panels) {
    panel.hidden = panel.id !== id;
  }

  // 2) 버튼: 선택된 버튼만 aria-pressed="true"로 표시 (보조기술 안내용)
  for (const button of buttons) {
    const isSelected = button.dataset.place === id;
    button.setAttribute("aria-pressed", isSelected ? "true" : "false");
  }

  // 3) 지도: 선택한 장소의 검색어로 iframe 주소를 바꿈
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

// 버튼마다 클릭 이벤트를 등록. data-place 값을 읽어서 showPlace에 전달.
buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    showPlace(button.dataset.place);
  });
});

// 첫 접속 시 첫 번째 장소(중앙도서관)가 기본으로 선택되어 있어야 함
showPlace(places[0].id);