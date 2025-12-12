"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function SongChart({
  data,
}: {
  data: { year: number; position: number }[];
}) {
  const formatted = data.map((d) => ({
    year: d.year,
    rank: d.position,
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>

          {/* Subtle dotted grid */}
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

          <XAxis
            dataKey="year"
            stroke="#444"
            interval="preserveStartEnd"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            stroke="#444"
            tick={{ fontSize: 12 }}
            reversed={true}
            domain={["dataMin - 2", "dataMax + 2"]}
          />

          <Tooltip
            formatter={(value) => `Rank #${value}`}
            labelFormatter={(label) => `Year ${label}`}
          />

          <Line
            type="natural"
            dataKey="rank"
            stroke="#C81E1E"
            strokeWidth={3}
            dot={{ r: 5, fill: "#C81E1E" }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
