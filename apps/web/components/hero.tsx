const stats = [
  {
    label: "Primary User",
    value: "5-100名の業務チーム"
  },
  {
    label: "First Revenue",
    value: "月額SaaS課金"
  },
  {
    label: "Initial Stack",
    value: "Next.js + PostgreSQL + Redis"
  }
];

export function Hero() {
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">Meeting Task SaaS</p>
        <h1>会議の記録ではなく、会議後の仕事を前に進める。</h1>
        <p>
          音声またはメモから要約、決定事項、担当付きタスクを抽出する
          B2B 向け Web アプリの初期骨格です。
        </p>
      </div>
      <div className="hero-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
