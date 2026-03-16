import Link from "next/link";
import { getCurrentUser } from "../lib/auth";
import { Hero } from "../components/hero";

const features = [
  "会議メモや音声から要約を自動生成",
  "担当者付きアクションアイテムを抽出",
  "Slack や Notion に共有できる構成を想定"
];

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="page-shell">
      <Hero />
      <section className="feature-card">
        <p className="eyebrow">MVP Scope</p>
        <h2>最初に作るべき範囲</h2>
        <ul className="feature-list">
          {features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <div className="cta-row">
          <Link href={user ? "/meetings" : "/login"} className="primary-button">
            {user ? "Open Meetings MVP" : "Login"}
          </Link>
        </div>
      </section>
    </main>
  );
}
