import React, { useMemo } from "react";
import { useSheetData } from "../../hooks/useSheetData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

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
    // Se os dois estão na lista, respeita a posição definida
    if (ia !== -1 && ib !== -1) return ia - ib;
    // Itens fora da lista vão para o final, ordenados alfabeticamente
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    return -1;
  });
}

function BarChartConfig({
  question,
  questionB,
  title,
  titleSize,
  eixoX,
  isMain,
  orderX,
  orderY,
  typsF,
  typsB
}) {
  const { data, loading, cores, keyMap } = useSheetData();
  const COLORS = COLOR_PALETTES[cores] || COLOR_PALETTES.default;

  const realKey = keyMap[question] ?? question;
  const realKeyB = keyMap[questionB] ?? questionB;
   const totalOpcoes = data.length;

  const { chartData, keys } = useMemo(() => {
    const grouped = {};
    const keySet = new Set();
    data.forEach((item) => {
      const x = (item[realKey] || "").trim();
      const y = (item[realKeyB] || "").trim();
      if (!x || !y) return;
      if (!grouped[x]) grouped[x] = { name: x };
      grouped[x][y] = (grouped[x][y] || 0) + 1;
      keySet.add(y);
    });

    // Ordena os grupos do eixo X
    const sortedGroups = sortByOrder(Object.keys(grouped), orderX);
    const sortedChartData = sortedGroups.map((name) => grouped[name]);

    // Ordena as barras internas (legenda)
    const sortedKeys = sortByOrder([...keySet], orderY);

    return { chartData: sortedChartData, keys: sortedKeys };
  }, [data, realKey, realKeyB, orderX, orderY]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const total = payload.reduce((a, p) => a + p.value, 0);
    return (
      <div
        style={{
          background: "#fff",
          padding: "10px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          fontSize: 12,
          color: "#000",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}
      >
        <p style={{ margin: "0 0 4px", fontWeight: 700 }}>
          {eixoX ? `${eixoX}: ` : ""}
          {payload[0].payload.name}
        </p>
        <p style={{ margin: "0 0 2px", color: "#64748b" }}>
          Total de alunos: {total}
        </p>
        {payload.map((p, i) => (
          <p key={i} style={{ margin: 0 }}>{`
            ${typsF} ${p.dataKey} ${typsB} : ${p.value} alunos`}
          </p>
        ))}
      </div>
    );
  };

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
          margin: "0 0 4px",
        }}
      >
        {title}
      </h3>
      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="name"
              label={
                isMain
                  ? {
                      value: eixoX,
                      position: "insideLeft",
                      offset: -60,
                      dy: 10,
                      style: {
                        fontSize: titleSize - 10,
                        fill: "#374151",
                        fontWeight: 500,
                      },
                    }
                  : undefined
              }
            />
            <YAxis
              label={
                isMain
                  ? {
                      value: "Total de alunos",
                      angle: -90,
                      offset: 70,
                      dx: -20,
                      position: "insideBottom",
                      style: {
                        fontSize: titleSize - 10,
                        fill: "#374151",
                        fontWeight: 500,
                      },
                    }
                  : undefined
              }
            />
            {isMain && <Tooltip content={<CustomTooltip />} />}
            {isMain && (
              <Legend
            iconSize={Math.max(
                  10,
                  titleSize / Math.sqrt(totalOpcoes),
                )}
              wrapperStyle={{
                fontSize: Math.max(
                  10,
                  titleSize / Math.sqrt(totalOpcoes),
                ),
              }}
              formatter={(value) => `${typsF} ${value} ${typsB}`}
            />
            )}
            {keys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                fill={COLORS[i % COLORS.length]}
                radius={[3, 3, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default BarChartConfig;
