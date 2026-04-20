const features = [
  {
    title: 'Para jugadores',
    description:
      'Registrate, anotate a torneos y seguí el crecimiento de la plataforma desde tu cuenta.',
  },
  {
    title: 'Para organizadores',
    description:
      'Creá organizaciones, publicá torneos y administrá la competencia desde una sola interfaz.',
  },
  {
    title: 'Para la liga',
    description:
      'Gestioná temporadas, puntos, estados y reglas sin depender de herramientas externas.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="mt-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Qué va a ofrecer la plataforma</h2>
        <p className="mt-2 text-slate-400">
          Una base simple hoy, pensada para crecer bien mañana.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {features.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
          >
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}