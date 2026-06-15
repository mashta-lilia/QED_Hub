import { ArrowRight, Network } from "lucide-react";
import { type CSSProperties, useState } from "react";

interface IntroPageProps {
  onContinue: () => void;
}

const nodes = [
  { id: "1", x: 330, y: 70 },
  { id: "2", x: 445, y: 130 },
  { id: "3", x: 475, y: 245 },
  { id: "4", x: 385, y: 350 },
  { id: "5", x: 245, y: 350 },
  { id: "6", x: 155, y: 245 },
  { id: "7", x: 190, y: 130 },
];

const edges = [
  ["1", "2"],
  ["2", "3"],
  ["3", "4"],
  ["4", "5"],
  ["5", "6"],
  ["6", "7"],
  ["7", "1"],
  ["1", "4"],
  ["2", "5"],
  ["3", "6"],
  ["7", "4"],
];

export function IntroPage({ onContinue }: IntroPageProps) {
  const [isLive, setIsLive] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-4 py-10">
      <section className="page-reveal w-full max-w-6xl text-center">
        

        <div
          className={[
            "awaken-stage relative mx-auto mt-9 max-w-4xl overflow-hidden rounded-[32px] border border-[#21385a] bg-[#07111f] shadow-float",
            isLive ? "is-live" : "",
          ].join(" ")}
        >
          <div className="relative z-10 px-5 pt-10 font-quote text-2xl italic leading-10 text-slate-400 sm:text-3xl">
            Сім мостів Кеніґсберга чекали відповіді:
            <br />
            чи можна пройти кожен лиш раз?
          </div>

          <svg
            className="relative z-10 mx-auto block h-auto w-full max-w-[660px]"
            viewBox="0 0 660 470"
            role="img"
            aria-label="Анімований граф Кеніґсберга"
          >
            <g className="awaken-ghost">
              {edges.map(([from, to]) => {
                const a = nodes.find((node) => node.id === from)!;
                const b = nodes.find((node) => node.id === to)!;

                return <line key={`ghost-${from}-${to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
              })}
            </g>

            {edges.map(([from, to], index) => {
              const a = nodes.find((node) => node.id === from)!;
              const b = nodes.find((node) => node.id === to)!;
              const length = Math.hypot(b.x - a.x, b.y - a.y);

              return (
                <line
                  key={`${from}-${to}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className="awaken-edge"
                  style={
                    {
                      "--edge-length": length,
                      animationDelay: `${0.12 + index * 0.08}s`,
                    } as CSSProperties
                  }
                />
              );
            })}

            {nodes.map((node, index) => (
              <g key={node.id} className="awaken-node" style={{ animationDelay: `${0.7 + index * 0.08}s` }}>
                <circle cx={node.x} cy={node.y} r="23" />
                <text x={node.x} y={node.y + 7} textAnchor="middle">
                  {node.id}
                </text>
              </g>
            ))}

            <circle className="awaken-tracer" r="6" />
          </svg>

          {!isLive ? (
            <button
              type="button"
              onClick={() => setIsLive(true)}
              className="absolute left-1/2 top-1/2 z-20 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-[20px] border-2 border-accent bg-[#07111f]/88 px-8 py-5 font-display text-2xl font-semibold text-slate-100 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_60px_rgba(47,111,219,0.24)] backdrop-blur transition hover:-translate-y-[52%] hover:bg-[#0b1728] sm:px-12"
            >
              Оживити граф
              <Network size={30} aria-hidden="true" />
            </button>
          ) : null}

          {isLive ? (
            <div className="awaken-caption relative z-10 px-6 pb-10 font-quote text-2xl italic leading-9 text-slate-300">
              Звідси у 1736 році народилась теорія графів —
              <br />
              наука про зв'язки між усіма речами.
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onContinue}
          className={[
            "mt-8 inline-flex items-center gap-3 rounded-[18px] bg-accent px-8 py-4 font-display text-lg font-extrabold text-white shadow-soft transition hover:-translate-y-1 hover:brightness-105",
            isLive ? "opacity-100" : "pointer-events-none opacity-0",
          ].join(" ")}
        >
          Перейти до теми
          <ArrowRight size={22} aria-hidden="true" />
        </button>
      </section>
    </main>
  );
}
