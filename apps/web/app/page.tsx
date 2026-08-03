const capabilities = [
  { number: "01", title: "Sohbet", description: "Düşüncelerinizi geliştiren, bağlamı koruyan akıcı konuşmalar." },
  { number: "02", title: "Projects", description: "Konuşmaları ve kaynakları tek bir odak altında düzenleyin." },
  { number: "03", title: "Artifacts", description: "Fikirlerinizi ayrı bir çalışma yüzeyinde görün ve geliştirin." }
] as const;

export default function Home() {
  return (
    <main>
      <nav className="nav" aria-label="Ana navigasyon">
        <a className="brand" href="#top" aria-label="Açık Alan ana sayfa">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span>Açık Alan</span>
        </a>
        <span className="phase">Temel sürüm · 01</span>
      </nav>

      <section className="hero" id="top">
        <p className="eyebrow"><span /> Yeni nesil AI çalışma alanı</p>
        <h1>Düşünmek için<br />daha <em>açık</em> bir alan.</h1>
        <p className="intro">
          Sohbetlerinizi, projelerinizi ve üretimlerinizi tek bir sakin çalışma alanında buluşturun.
        </p>
        <div className="actions">
          <a className="primary" href="#yakinda">Çalışma alanını keşfet <span aria-hidden="true">↗</span></a>
          <a className="secondary" href="#yaklasim">Yaklaşımımız</a>
        </div>
        <div className="orb" aria-hidden="true"><div className="orb-core" /></div>
      </section>

      <section className="capabilities" id="yaklasim" aria-labelledby="capabilities-title">
        <div className="section-heading">
          <p>Çalışma biçiminiz,<br />yeniden düşünüldü.</p>
          <h2 id="capabilities-title">Sessizce güçlü.<br />Daima yanınızda.</h2>
        </div>
        <div className="capability-grid">
          {capabilities.map((capability) => (
            <article key={capability.number}>
              <span>{capability.number}</span>
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="closing" id="yakinda">
        <p>İlk adım atıldı.</p>
        <h2>Çalışma alanınız<br />yakında burada.</h2>
        <span>Platform temeli hazırlanıyor</span>
      </section>
    </main>
  );
}
