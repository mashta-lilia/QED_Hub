import { useState, useMemo, useRef, useEffect } from 'react';
import { ringLayout, G_NODE, G_GREEN, G_ODD } from '../lib/graph';
import { RichText, Tex } from '../lib/math';

/* === Лаб 1: лема про рукостискання === */
export function DegreeLab({ accent }: { accent: string }) {
  const ids = ['1', '2', '3', '4', '5', '6'];
  const pos = useMemo(() => ringLayout(ids, 160, 150, 112), []);
  const [edges, setEdges] = useState<[string, string][]>([
    ['1', '2'], ['2', '3'], ['1', '3'], ['3', '4'], ['4', '5'], ['4', '6'],
  ]);
  const [sel, setSel] = useState<string | null>(null);
  const key = (a: string, b: string) => [a, b].sort().join('-');
  const eset = new Set(edges.map((e) => key(e[0], e[1])));
  function clickNode(id: string) {
    if (sel == null) {
      setSel(id);
      return;
    }
    if (sel === id) {
      setSel(null);
      return;
    }
    const k = key(sel, id);
    setEdges((es) => (eset.has(k) ? es.filter((e) => key(e[0], e[1]) !== k) : [...es, [sel, id]]));
    setSel(null);
  }
  const deg: Record<string, number> = {};
  ids.forEach((id) => (deg[id] = 0));
  edges.forEach((e) => {
    deg[e[0]]++;
    deg[e[1]]++;
  });
  const sum = ids.reduce((s, id) => s + deg[id], 0);
  return (
    <div className="af-card">
      <RichText
        tag="p"
        className="af-lead"
        text={"Клацніть дві вершини, щоб з'єднати їх ребром (або прибрати наявне). Стежте за степенями $\\delta(v)$ і перевіряйте лему про рукостискання $\\sum_v\\delta(v)=2|E|$."}
      />
      <div className="af-panel" style={{ padding: '8px' }}>
        <svg viewBox="0 0 320 300" className="gsvg">
          {edges.map((e, i) => {
            const a = pos[e[0]],
              b = pos[e[1]];
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#5b86c7" strokeWidth="2.6" strokeLinecap="round" />;
          })}
          {ids.map((id) => {
            const n = pos[id];
            const on = sel === id;
            return (
              <g key={id} style={{ cursor: 'pointer' }} onClick={() => clickNode(id)}>
                <circle cx={n.x} cy={n.y} r="18" fill={on ? accent : G_NODE} stroke="#0f1a2b" strokeWidth="2.5" />
                <text x={n.x} y={n.y} className="glabel">{id}</text>
                <text x={n.x} y={n.y - 27} className="gtag" textAnchor="middle" fill="#9fb3cc">δ={deg[id]}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="lab-readouts">
        <div className="lab-ro"><span>вершин |V|</span><b>{ids.length}</b></div>
        <div className="lab-ro"><span>ребер |E|</span><b>{edges.length}</b></div>
        <div className="lab-ro"><span>Σ δ(v)</span><b>{sum}</b></div>
        <div className="lab-ro"><span>2·|E|</span><b>{2 * edges.length}</b></div>
      </div>
      <div className="lab-ok good">
        <Tex tex={'\\textstyle\\sum_v\\delta(v)=' + sum + '=2\\cdot' + edges.length} />
        <span>✓ сума завжди парна</span>
      </div>
    </div>
  );
}

/* === Лаб 2: розфарбування графа (колесо W6, χ=3) === */
export function ColorLab() {
  const PAL = [
    { v: 0, c: '#dbe6f3' },
    { v: 1, c: '#2f6fdb' },
    { v: 2, c: '#1f9d6b' },
    { v: 3, c: '#e0922f' },
    { v: 4, c: '#d24a52' },
  ];
  const outer = ['a', 'b', 'c', 'd', 'e', 'f'];
  const pos = useMemo(() => {
    const o = ringLayout(outer, 160, 150, 116);
    o['o'] = { id: 'o', x: 160, y: 150 };
    return o;
  }, []);
  const ids = [...outer, 'o'];
  const edges: [string, string][] = [];
  for (let i = 0; i < outer.length; i++) {
    edges.push([outer[i], outer[(i + 1) % outer.length]]);
    edges.push([outer[i], 'o']);
  }
  const [col, setCol] = useState<Record<string, number>>({});
  const [pick, setPick] = useState(1);
  const used = new Set(Object.keys(col).filter((id) => col[id]).map((id) => col[id]));
  const allColored = ids.every((id) => col[id]);
  const conflict = edges.some(([a, b]) => col[a] && col[a] === col[b]);
  const proper = allColored && !conflict;
  const fillOf = (id: string) => {
    const v = col[id];
    const p = PAL.find((p) => p.v === v);
    return p ? p.c : '#dbe6f3';
  };
  return (
    <div className="af-card">
      <RichText
        tag="p"
        className="af-lead"
        text={'Оберіть колір і клацайте вершини. Мета — щоб жодні дві суміжні вершини не мали однакового кольору. Це колесо потребує рівно $\\chi=3$ кольори (зовнішній шестикутник + центр).'}
      />
      <div className="lab-palette" style={{ marginBottom: '10px' }}>
        {PAL.map((p) => (
          <button
            key={p.v}
            className={'lab-sw' + (pick === p.v ? ' on' : '')}
            style={{ background: p.c }}
            title={p.v === 0 ? 'стерти' : 'колір ' + p.v}
            onClick={() => setPick(p.v)}
          />
        ))}
        <button className="lab-btn" style={{ marginLeft: 'auto' }} onClick={() => setCol({})}>
          Очистити
        </button>
      </div>
      <div className="af-panel" style={{ padding: '8px' }}>
        <svg viewBox="0 0 320 300" className="gsvg">
          {edges.map(([a, a2], i) => {
            const p = pos[a],
              q = pos[a2];
            const bad = col[a] && col[a] === col[a2];
            return (
              <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={bad ? G_ODD : '#5b86c7'} strokeWidth={bad ? 3.4 : 2.4} strokeLinecap="round" />
            );
          })}
          {ids.map((id) => {
            const n = pos[id];
            return (
              <g key={id} style={{ cursor: 'pointer' }} onClick={() => setCol((c) => ({ ...c, [id]: pick }))}>
                <circle cx={n.x} cy={n.y} r="18" fill={fillOf(id)} stroke="#0f1a2b" strokeWidth="2.5" />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="lab-readouts" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="lab-ro"><span>розфарбовано</span><b>{Object.keys(col).filter((id) => col[id]).length}/{ids.length}</b></div>
        <div className="lab-ro"><span>кольорів</span><b>{used.size}</b></div>
        <div className="lab-ro"><span>χ(G)</span><b>3</b></div>
      </div>
      {proper ? (
        <div className="lab-ok good">
          <span>✓ Правильне розфарбування{used.size <= 3 ? ' — і мінімальне!' : ' (' + used.size + ' кольори, спробуйте 3)'}</span>
        </div>
      ) : (
        <div className="lab-ok bad">
          <span>{conflict ? '✗ Є суміжні вершини одного кольору (червоні ребра)' : 'Розфарбуйте всі вершини…'}</span>
        </div>
      )}
    </div>
  );
}

/* === Лаб 3: мости Кеніґсберга та ейлерів обхід === */
export function EulerLab() {
  const [tab, setTab] = useState<'k' | 'e'>('k');
  /* Кеніґсберг: мультиграф, степені 5,3,3,3 — усі непарні */
  const kpos: Record<string, { x: number; y: number }> = {
    A: { x: 160, y: 80 },
    B: { x: 60, y: 170 },
    C: { x: 260, y: 170 },
    D: { x: 160, y: 250 },
  };
  const kdeg: Record<string, number> = { A: 5, B: 3, C: 3, D: 3 };
  const kedges: [string, string, number][] = [
    ['A', 'B', -26], ['A', 'B', 26], ['A', 'C', -26], ['A', 'C', 26], ['A', 'D', 0], ['B', 'D', -22], ['C', 'D', 22],
  ];
  /* ейлерів граф: дві трикутні «петлі» зі спільною вершиною, усі степені парні */
  const epos: Record<string, { x: number; y: number }> = {
    '1': { x: 70, y: 80 },
    '2': { x: 70, y: 220 },
    '3': { x: 165, y: 150 },
    '4': { x: 260, y: 80 },
    '5': { x: 260, y: 220 },
  };
  const eedges: [string, string][] = [['1', '2'], ['2', '3'], ['3', '1'], ['3', '4'], ['4', '5'], ['5', '3']];
  const seq = ['1', '2', '3', '4', '5', '3', '1'];
  const [step, setStep] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const ekey = (a: string, b: string) => [a, b].sort().join('-');
  function play() {
    if (timer.current) clearInterval(timer.current);
    setStep(0);
    timer.current = setInterval(() => {
      setStep((s) => {
        if (s >= seq.length - 1) {
          if (timer.current) clearInterval(timer.current);
          return s;
        }
        return s + 1;
      });
    }, 850);
  }
  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);
  const traversed = new Set<string>();
  for (let i = 0; i < step; i++) traversed.add(ekey(seq[i], seq[i + 1]));
  const cur = epos[seq[step]];
  return (
    <div className="af-card">
      <div className="lab-tabs">
        <button className={'lab-tab' + (tab === 'k' ? ' on' : '')} onClick={() => setTab('k')}>
          Сім мостів Кеніґсберга
        </button>
        <button className={'lab-tab' + (tab === 'e' ? ' on' : '')} onClick={() => setTab('e')}>
          Ейлерів обхід
        </button>
      </div>
      {tab === 'k' ? (
        <>
          <RichText
            tag="p"
            className="af-lead"
            text={"Береги $B,C$ та острови $A,D$ з'єднані сімома мостами. Степені всіх чотирьох вершин — непарні $(5,3,3,3)$, тож ейлерового циклу не існує: обійти кожен міст рівно раз і повернутись назад неможливо."}
          />
          <div className="af-panel" style={{ padding: '8px' }}>
            <svg viewBox="0 0 320 300" className="gsvg">
              {kedges.map(([a, b, cv], i) => {
                const p = kpos[a],
                  q = kpos[b];
                const dx = q.x - p.x,
                  dy = q.y - p.y,
                  L = Math.hypot(dx, dy) || 1,
                  ux = dx / L,
                  uy = dy / L;
                const mx = (p.x + q.x) / 2 - uy * cv,
                  my = (p.y + q.y) / 2 + ux * cv;
                return <path key={i} d={`M${p.x} ${p.y} Q${mx} ${my} ${q.x} ${q.y}`} fill="none" stroke="#e0922f" strokeWidth="3" strokeLinecap="round" />;
              })}
              {Object.keys(kpos).map((id) => {
                const n = kpos[id];
                return (
                  <g key={id}>
                    <circle cx={n.x} cy={n.y} r="20" fill={G_ODD} stroke="#0f1a2b" strokeWidth="2.5" />
                    <text x={n.x} y={n.y} className="glabel" style={{ fontSize: 16 }}>{id}</text>
                    <text x={n.x} y={n.y - 29} className="gtag" textAnchor="middle" fill="#f0b3b7">δ={kdeg[id]} (непарн.)</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="lab-ok bad">
            <span>✗ Усі $4$ вершини непарні → ейлерового циклу немає (Ейлер, 1736)</span>
          </div>
        </>
      ) : (
        <>
          <RichText
            tag="p"
            className="af-lead"
            text={'А цей граф ейлерів: степені всіх вершин парні. Натисніть «Запустити» — точка пройде кожне ребро рівно один раз і повернеться у початок.'}
          />
          <div className="af-panel" style={{ padding: '8px' }}>
            <svg viewBox="0 0 330 300" className="gsvg">
              {eedges.map(([a, b], i) => {
                const p = epos[a],
                  q = epos[b];
                const done = traversed.has(ekey(a, b));
                return <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={done ? G_GREEN : '#3a557a'} strokeWidth={done ? 4.5 : 2.6} strokeLinecap="round" />;
              })}
              {Object.keys(epos).map((id) => {
                const n = epos[id];
                return (
                  <g key={id}>
                    <circle cx={n.x} cy={n.y} r="17" fill={G_NODE} stroke="#0f1a2b" strokeWidth="2.5" />
                    <text x={n.x} y={n.y} className="glabel">{id}</text>
                  </g>
                );
              })}
              <circle cx={cur.x} cy={cur.y} r="9" fill="#fff" stroke={G_GREEN} strokeWidth="3" style={{ transition: 'cx .5s ease,cy .5s ease' }} />
            </svg>
          </div>
          <div className="lab-row" style={{ justifyContent: 'space-between', marginTop: '12px' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '13px', color: 'var(--ink-soft)' }}>
              Маршрут: {seq.slice(0, step + 1).join(' → ')}
            </div>
            <button className="lab-btn solid" onClick={play}>▶ Запустити обхід</button>
          </div>
          {step >= seq.length - 1 && (
            <div className="lab-ok good">
              <span>✓ Усі $6$ ребер пройдено по разу — це ейлерів цикл</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
