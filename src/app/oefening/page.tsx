import type { Metadata } from "next";
import { Guide } from "@/components/guide/guide";

export const metadata: Metadata = { title: "Oefening instructie" };

export default function OefeningPage() {
  return <Guide />;
}
