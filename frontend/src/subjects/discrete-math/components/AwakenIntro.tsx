import React, { useMemo, useState } from 'react';
import { ChevR } from '../../../components/common/Icons';
import { ringLayout } from '../../../lib/graph';
import { RichText } from '../../../lib/math';

interface AwakenIntroProps {
  accent: string;
  onContinue: () => void;
}

export function AwakenIntro({ accent, onContinue }: AwakenIntroProps) {
  const [live, setLive] = useState(false);
  const geo = useMemo(() => {
    const ids = ['1', '2', '3', '4', '5', '6', '7'];
    const positions = ringLayout(ids, 330, 150, 120);
    const edges: [string, string][] = [];

    for (let i = 0; i < ids.length; i++) edges.push([ids[i], ids[(i + 1) % ids.length]]);
    (
      [
        ['1', '4'],
        ['2', '5'],
        ['3', '6'],
        ['4', '7'],
      ] as [string, string][]
    ).forEach((edge) => edges.push(edge));

    const cycPath = 'M' + ids.map((id) => positions[id].x.toFixed(1) + ' ' + positions[id].y.toFixed(1)).join(' L') + ' Z';

    return { ids, positions, edges, cycPath };
  }, []);

  return (
    <div className="aw-wrap">
      <div className={'aw' + (live ? ' live' : '')}>
        <div className="aw-stage">
          <RichText
            tag="div"
            className="aw-poem aw-poem-top"
            text={'Сім мостів Кеніґсберга чекали відповіді:\nчи можна пройти кожен лиш раз?'}
          />
          <svg viewBox="0 0 660 300" className="aw-svg">
            {geo.edges.map((edge, index) => {
              const a = geo.positions[edge[0]];
              const b = geo.positions[edge[1]];
              const length = Math.hypot(b.x - a.x, b.y - a.y);

              return (
                <line
                  key={index}
                  className="aw-gedge"
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  style={{ '--l': length, strokeDasharray: length, animationDelay: 0.25 + index * 0.07 + 's' } as React.CSSProperties}
                />
              );
            })}
            {geo.ids.map((id, index) => {
              const node = geo.positions[id];

              return (
                <g key={id} className="aw-gnode" style={{ animationDelay: 0.15 + index * 0.11 + 's' }}>
                  <circle cx={node.x} cy={node.y} r="16" fill={accent} stroke="#0a1322" strokeWidth="2.5" />
                  <text x={node.x} y={node.y} className="glabel">
                    {id}
                  </text>
                </g>
              );
            })}
            <circle className="aw-gtracer" r="7.5" fill="#ffffff" style={{ offsetPath: `path('${geo.cycPath}')` } as React.CSSProperties} />
            <circle
              className="aw-gtracer"
              r="5"
              fill={accent}
              style={{ offsetPath: `path('${geo.cycPath}')`, animationDelay: '0.25s' } as React.CSSProperties}
            />
          </svg>
          <RichText
            tag="div"
            className="aw-poem aw-poem-bot"
            text={'Звідси у $1736$ році народилась теорія графів —\nнаука про звʼязки між усіма речами.'}
          />
          <div className="aw-activate-wrap">
            <button className="aw-activate" onClick={() => setLive(true)}>
              Оживити граф
              <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
                <line x1="3" y1="11" x2="10" y2="3" stroke="currentColor" strokeWidth="1.6" />
                <line x1="10" y1="3" x2="17" y2="11" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="3" cy="11" r="2.6" fill="currentColor" />
                <circle cx="10" cy="3" r="2.6" fill="currentColor" />
                <circle cx="17" cy="11" r="2.6" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
        <div className="aw-continue">
          <button className="cover-cta" style={{ background: accent }} onClick={onContinue}>
            Перейти до теми <ChevR />
          </button>
        </div>
      </div>
    </div>
  );
}
