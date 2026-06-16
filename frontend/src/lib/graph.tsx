import React, { useId } from 'react';
import type { GNode, GEdge, GraphData } from '../types';
import { RichText } from './math';

/* Кольори вузлів графів */
export const G_NODE = '#2f6fdb';
export const G_GREEN = '#1f9d6b';
export const G_ODD = '#d24a52';
export const G_AMBER = '#e0922f';
export const G_PURPLE = '#6d4ad1';

/** Розкладає набір вершин по колу. */
export function ringLayout(
  ids: string[],
  cx: number,
  cy: number,
  r: number,
  a0?: number,
): Record<string, GNode> {
  const start = a0 == null ? -Math.PI / 2 : a0;
  const n = ids.length;
  const o: Record<string, GNode> = {};
  ids.forEach((id, i) => {
    const a = start + (2 * Math.PI * i) / n;
    o[id] = { id, x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  return o;
}

function edgeEnds(e: GEdge): { a: string; b: string } {
  return Array.isArray(e) ? { a: e[0], b: e[1] } : { a: e.a, b: e.b };
}

interface GraphDiagramProps {
  nodes: GNode[];
  edges: GEdge[];
  directed?: boolean;
  w?: number;
  h?: number;
  nodeR?: number;
  edgeColor?: string;
  dark?: boolean;
  fills?: Record<string, string>;
}

/** Статична діаграма графа для теорії. */
export function GraphDiagram({
  nodes,
  edges,
  directed,
  w = 320,
  h = 240,
  nodeR = 16,
  edgeColor,
  dark,
  fills,
}: GraphDiagramProps) {
  const map: Record<string, GNode> = {};
  nodes.forEach((n) => (map[n.id] = n));
  const ec = edgeColor || (dark ? '#5b86c7' : '#8aa3c4');
  const mk = 'ar' + useId().replace(/[:]/g, '');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="gsvg">
      {directed && (
        <defs>
          <marker id={mk} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={ec} />
          </marker>
        </defs>
      )}
      {edges.map((e, i) => {
        const ends = edgeEnds(e);
        const a = map[ends.a];
        const b = map[ends.b];
        if (!a || !b) return null;
        const obj = Array.isArray(e) ? null : e;
        const cv = obj?.curve || 0;
        const clr = obj?.color || ec;
        const wd = obj?.w || 2.6;
        let x1 = a.x,
          y1 = a.y,
          x2 = b.x,
          y2 = b.y;
        const dx = x2 - x1,
          dy = y2 - y1,
          L = Math.hypot(dx, dy) || 1,
          ux = dx / L,
          uy = dy / L;
        if (directed) {
          x1 += ux * nodeR;
          y1 += uy * nodeR;
          x2 -= ux * nodeR;
          y2 -= uy * nodeR;
        }
        if (cv) {
          const mx = (x1 + x2) / 2 - uy * cv,
            my = (y1 + y2) / 2 + ux * cv;
          return (
            <path
              key={i}
              d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`}
              fill="none"
              stroke={clr}
              strokeWidth={wd}
              strokeLinecap="round"
              markerEnd={directed ? `url(#${mk})` : undefined}
            />
          );
        }
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={clr}
            strokeWidth={wd}
            strokeLinecap="round"
            markerEnd={directed ? `url(#${mk})` : undefined}
          />
        );
      })}
      {nodes.map((n) => (
        <g key={n.id}>
          <circle
            cx={n.x}
            cy={n.y}
            r={n.r || nodeR}
            fill={(fills && fills[n.id]) || n.fill || G_NODE}
            stroke={dark ? '#0f1a2b' : '#fff'}
            strokeWidth="2.5"
          />
          {n.label !== false && (
            <text x={n.x} y={n.y} className="glabel" style={{ fontSize: (n.r || nodeR) * 0.82 }}>
              {n.label != null ? n.label : n.id}
            </text>
          )}
          {n.sub != null && (
            <text x={n.x} y={n.y - (n.r || nodeR) - 9} className="gtag" textAnchor="middle" fill={dark ? '#9fb3cc' : '#8194ab'}>
              {n.sub}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

interface GFigProps {
  children: React.ReactNode;
  caption?: string;
  dark?: boolean;
  half?: boolean;
}
export function GFig({ children, caption, dark, half }: GFigProps) {
  return (
    <figure className={'gfig' + (dark ? ' gfig-dark' : '')} style={half ? { margin: 0 } : {}}>
      {children}
      {caption && <RichText tag="figcaption" className="gcap" text={caption} />}
    </figure>
  );
}

/** Дані повного графа K5 (вершини по колу + усі ребра). */
export function k5data(cx: number, cy: number, r: number): GraphData {
  const ids = ['1', '2', '3', '4', '5'];
  const p = ringLayout(ids, cx, cy, r);
  const e: GEdge[] = [];
  for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) e.push([ids[i], ids[j]]);
  return { nodes: ids.map((id) => p[id]), edges: e };
}
