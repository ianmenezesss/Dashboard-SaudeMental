import React, { useMemo } from "react";
import { useSheetData } from "../../hooks/useSheetData";

const COLOR_PALETTES = {
  default: [
    "#4F46E5",
    "#06B6D4",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
  ],
  Tritanopia: [
    "#D55E00",
    "#E69F00",
    "#009E73",
    "#56B4E9",
    "#CC79A7",
    "#F0E442",
  ],
  Deuteranopia: [
    "#0072B2",
    "#D55E00",
    "#009E73",
    "#F0E442",
    "#CC79A7",
    "#56B4E9",
  ],
  Protanopia: [
    "#0072B2",
    "#009E73",
    "#56B4E9",
    "#F0E442",
    "#E69F00",
    "#CC79A7",
  ],
};

function sortByOrder(arr, orderList) {
  if (!orderList) return arr;
  return [...arr].sort((a, b) => {
    const ia = orderList.indexOf(a);
    const ib = orderList.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    return -1;
  });
}

function HeatmapChart({
  question,
  questionB,
  title,
  titleSize,
  isMain,
  orderX,
  orderY,
  typsF,
  typsB,
}) {
  const { data, loading, cores, keyMap } = useSheetData();

  const realKey = keyMap[question] ?? question;
  const realKeyB = keyMap[questionB] ?? questionB;

  const { matrix, xKeys, yKeys, max } = useMemo(() => {
    const counts = {};
    const xs = new Set();
    const ys = new Set();

    data.forEach((item) => {
      const x = (item[realKey] || "").trim();
      const y = (item[realKeyB] || "").trim();
      if (!x || !y) return;

      xs.add(x);
      ys.add(y);

      const key = `${x}|||${y}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    const sortedX = sortByOrder([...xs], orderX);
    const sortedY = sortByOrder([...ys], orderY);

    return {
      matrix: counts,
      xKeys: sortedX,
      yKeys: sortedY,
      max: Math.max(...Object.values(counts), 1),
    };
  }, [data, realKey, realKeyB, orderX, orderY]);

  const getColor = (value) => {
    if (!value) return "#f1f5f9";
    const t = value / max;

    const palettes = {
      default: (t) => `hsl(${240 - t * 180}, 80%, ${70 - t * 35}%)`,
      Tritanopia: (t) => `hsl(${40 + t * 100}, 70%, ${60 + t * 15}%)`,
      Deuteranopia: (t) => `hsl(${220 - t * 150}, 90%, ${50 + t * 30}%)`,
      Protanopia: (t) => `hsl(${200 - t * 40}, 60%, ${30 + t * 30}%)`,
    };

    return (palettes[cores] || palettes.default)(t);
  };

  const cellSize = Math.min(
    48,
    Math.floor(260 / Math.max(xKeys.length, yKeys.length, 1)),
  );

  const labelSize = Math.max(9, Math.min(12, cellSize * 0.22));

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#64748b",
        }}
      >
        Carregando...
      </div>
    );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3
        style={{
          textAlign: "center",
          color: "black",
          fontSize: titleSize,
          marginBottom: 6,
        }}
      >
        {title}
      </h3>
      {isMain && (
        <div
          style={{
            textAlign: "center",
            fontSize: titleSize - 6,
            color: "#374151",
            marginBottom: 4,
            fontWeight: 500,
          }}
        >
          {typsF}
        </div>
      )}
      {/* 🔥 CONTAINER PRINCIPAL */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
        }}
      >
        {/* 🔥 SCROLL INTERNO CONTROLADO */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          {isMain && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                transform: "translate(-220px, -50%) rotate(-90deg)",
                transformOrigin: "center",
                fontSize: titleSize - 6,
                color: "#374151",
                fontWeight: 500,
                whiteSpace: "nowrap",
                pointerEvents: "none",
              }}
            >
              {typsB}
            </div>
          )}
          <table style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <td />
                {xKeys.map((x) => (
                  <th
                    key={x}
                    style={{
                      padding: "4px 2px",
                      textAlign: "center",
                      color: "#334155",
                      fontWeight: 600,
                      fontSize: labelSize,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {x}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {yKeys.map((y) => (
                <tr key={y}>
                  <td
                    style={{
                      padding: "2px 6px",
                      color: "#334155",
                      fontWeight: 600,
                      fontSize: labelSize,
                      whiteSpace: "nowrap",
                      textAlign: "right",
                    }}
                  >
                    {y}
                  </td>

                  {xKeys.map((x) => {
                    const val = matrix[`${x}|||${y}`] || 0;

                    return (
                      <td
                        key={x}
                        title={
                          isMain
                            ? `${typsF} : ${x} × ${typsB} : ${y} / alunos : ${val}`
                            : undefined
                        }
                        style={{
                          width: cellSize,
                          height: cellSize,
                          minWidth: cellSize,
                          minHeight: cellSize,
                          background: getColor(val),
                          textAlign: "center",
                          verticalAlign: "middle",
                          borderRadius: 4,
                          border: "2px solid #fff",
                          color: val / max > 0.55 ? "#fff" : "#334155",
                          fontWeight: 700,
                          fontSize: labelSize,
                        }}
                      >
                        {val > 0 ? val : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isMain && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 4,
            marginTop: 6,
            fontSize: labelSize,
          }}
        >
          <span style={{ color: "#64748b" }}>Menos</span>
          {[0.1, 0.35, 0.6, 0.85, 1].map((v) => (
            <div
              key={v}
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: getColor(v * max),
              }}
            />
          ))}
          <span style={{ color: "#64748b" }}>Mais</span>
        </div>
      )}
    </div>
  );
}

export default HeatmapChart;
