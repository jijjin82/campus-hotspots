const buttons = document.querySelectorAll(".place-btn");
const panels = document.querySelectorAll(".stat-panel");
const charts = {};

function showPanel(id) {
  for (const panel of panels) {
    panel.hidden = panel.id !== id;
  }
  for (const button of buttons) {
    button.setAttribute("aria-pressed", String(button.dataset.panel === id));
  }
  requestAnimationFrame(function () {
    if (charts[id]) charts[id].resize();
  });
}

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    showPanel(button.dataset.panel);
  });
});

showPanel("population");

function drawBarChart(canvasId, labels, values, label, color) {
  const ctx = document.querySelector("#" + canvasId);
  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: label,
          data: values,
          backgroundColor: color,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "명" },
        },
      },
    },
  });
}

Papa.parse("./data/population.csv", {
  download: true,
  header: true,
  skipEmptyLines: "greedy",
  complete: function (results) {
    const required = ["시군구", "총인구", "등록외국인"];
    const fields = (results.meta && results.meta.fields) || [];
    const hasAllColumns = required.every(function (name) {
      return fields.includes(name);
    });

    if (!hasAllColumns || results.errors.length > 0) {
      document.querySelector("#status").textContent =
        "CSV 형식을 확인하세요. 필요한 열: " + required.join(", ");
      return;
    }

    const rows = results.data.filter(function (row) {
      const name = (row["시군구"] || "").trim();
      return (
        name !== "" &&
        name !== "합계" &&
        Number.isFinite(Number(row["총인구"])) &&
        Number.isFinite(Number(row["등록외국인"]))
      );
    });

    if (rows.length === 0) {
      document.querySelector("#status").textContent = "그래프로 표시할 행이 없습니다.";
      return;
    }

    drawPopulationChart(rows);
    drawForeignerChart(rows);

    document.querySelector("#status").textContent =
      "표 행 수: " + rows.length + " / 제외한 행: " + (results.data.length - rows.length);
  },
  error: function () {
    document.querySelector("#status").textContent = "CSV 경로와 네트워크를 확인하세요.";
  },
});

function drawPopulationChart(rows) {
  const sorted = rows
    .slice()
    .sort(function (a, b) {
      return Number(b["총인구"]) - Number(a["총인구"]);
    })
    .slice(0, 10);

  const labels = sorted.map(function (row) {
    return row["시군구"];
  });
  const values = sorted.map(function (row) {
    return Number(row["총인구"]);
  });

  charts.population = drawBarChart(
    "chart-population",
    labels,
    values,
    "총인구 (명)",
    "#7455e9"
  );

  const top = sorted[0];
  const second = sorted[1];
  const diff = Number(top["총인구"]) - Number(second["총인구"]);

  document.querySelector("#interpret-population").textContent =
    "인구가 가장 많은 시는 " + top["시군구"] + "(" + Number(top["총인구"]).toLocaleString() +
    "명)이며, 2위 " + second["시군구"] + "보다 " + diff.toLocaleString() + "명 많습니다. " ;
}

function drawForeignerChart(rows) {
  const sorted = rows
    .slice()
    .sort(function (a, b) {
      return Number(b["등록외국인"]) - Number(a["등록외국인"]);
    })
    .slice(0, 10);

  const labels = sorted.map(function (row) {
    return row["시군구"];
  });
  const values = sorted.map(function (row) {
    return Number(row["등록외국인"]);
  });

  charts.foreigners = drawBarChart(
    "chart-foreigners",
    labels,
    values,
    "등록외국인 (명)",
    "#0e6ba8"
  );

  const top = sorted[0];
  const popRank = rows
    .slice()
    .sort(function (a, b) {
      return Number(b["총인구"]) - Number(a["총인구"]);
    })
    .findIndex(function (row) {
      return row["시군구"] === top["시군구"];
    }) + 1;

  document.querySelector("#interpret-foreigners").textContent =
    "등록외국인이 가장 많은 시는 " + top["시군구"] + "(" + Number(top["등록외국인"]).toLocaleString() +
    "명)이며, 이 시는 총인구 순위로는 " + popRank + "위입니다. " ;
}