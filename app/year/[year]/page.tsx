import React from 'react';

export default async function YearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Top 2000 of {year}</h1>
      <p>List of songs for {year} will appear here.</p>
    </div>
  );
}
