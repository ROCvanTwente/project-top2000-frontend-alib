// app/top2000/[year]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import Top2000Table from "../components/Top2000Table";

export default function Page() {
  return <Top2000Table/>;
}
