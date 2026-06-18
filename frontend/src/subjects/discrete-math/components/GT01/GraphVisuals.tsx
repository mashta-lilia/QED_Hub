import { useId, useMemo } from 'react';
import { RichText } from '../../../../lib/math';
import type { GraphData, GraphEdge } from '../../types';

export interface DegreeInfo {
  total: number;
  in: number;
  out: number;
}

export function computeDegrees(graph: GraphData): Record<string, DegreeInfo> {
  const degrees: Record<string, DegreeInfo> = {};
  graph.nodes.forEach((node) => {
    degrees[node.id] = { total: 0, in: 0, out: 0 };
  });

  graph.edges.forEach((edge) => {
    if (!degrees[edge.source] || !degrees[edge.target]) return;
    if (graph.directed || edge.directed) {
      degrees[edge.source].out += 1;
      degrees[edge.target].in += 1;
      degrees[edge.source].total += 1;
      degrees[edge.target].total += 1;
      return;
    }

    if (edge.source === edge.target) {
      degrees[edge.source].total += 2;
    } else {
      degrees[edge.source].total += 1;
      degrees[edge.target].total += 1;
    }
  });

  return degrees;
}

export function edgeKey(source: string, target: string, directed = false): string {
  return directed ? `${source}->${target}` : [source, target].sort().join('--');
}

interface GraphCanvasProps {
  graph: GraphData;
  width?: number;
  height?: number;
  selectedEdgeIds?: string[];
  mutedEdgeIds?: string[];
  selectedNodeIds?: string[];
  showDegrees?: boolean;
  showDirectedDegrees?: boolean;
  onEdgeClick?: (edge: GraphEdge) => void;
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

export function GraphCanvas({
  graph,
  width = 520,
  height = 340,
  selectedEdgeIds = [],
  mutedEdgeIds = [],
  selectedNodeIds = [],
  showDegrees,
  showDirectedDegrees,
  onEdgeClick,
  onNodeClick,
  className = '',
}: GraphCanvasProps) {
  const markerId = `gt01-arrow-${useId().replace(/:/g, '')}`;
  const nodesById = useMemo(() => {
    const map: Record<string, (typeof graph.nodes)[number]> = {};
    graph.nodes.forEach((node) => {
      map[node.id] = node;
    });
    return map;
  }, [graph.nodes]);
  const degrees = useMemo(() => computeDegrees(graph), [graph]);
  const hasSelection = selectedEdgeIds.length > 0 || mutedEdgeIds.length > 0;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={`gsvg ${className}`} role="img" aria-label="Граф">
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#2f6fdb" />
        </marker>
      </defs>

      {graph.edges.map((edge) => {
        const source = nodesById[edge.source];
        const target = nodesById[edge.target];
        if (!source || !target) return null;

        const id = edge.id || edgeKey(edge.source, edge.target, graph.directed || edge.directed);
        const selected = selectedEdgeIds.includes(id);
        const muted = mutedEdgeIds.includes(id);
        const directed = graph.directed || edge.directed;
        const stroke = selected ? '#2f6fdb' : muted ? '#dbe6f3' : edge.color || '#8aa3c4';
        const strokeWidth = selected ? 4.5 : muted ? 1.8 : 2.8;
        const opacity = hasSelection && !selected && !muted ? 0.45 : 1;

        let x1 = source.x;
        let y1 = source.y;
        let x2 = target.x;
        let y2 = target.y;
        if (directed) {
          const dx = x2 - x1;
          const dy = y2 - y1;
          const length = Math.hypot(dx, dy) || 1;
          x1 += (dx / length) * 18;
          y1 += (dy / length) * 18;
          x2 -= (dx / length) * 22;
          y2 -= (dy / length) * 22;
        }

        return (
          <g key={id} className={onEdgeClick ? 'cursor-pointer' : undefined} onClick={() => onEdgeClick?.(edge)}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={muted ? '7 9' : undefined}
              opacity={opacity}
              markerEnd={directed ? `url(#${markerId})` : undefined}
            />
            {onEdgeClick && (
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth="18" strokeLinecap="round" />
            )}
          </g>
        );
      })}

      {graph.nodes.map((node) => {
        const selected = selectedNodeIds.includes(node.id);
        const degree = degrees[node.id];
        return (
          <g key={node.id} className={onNodeClick ? 'cursor-pointer' : undefined} onClick={() => onNodeClick?.(node.id)}>
            <circle
              cx={node.x}
              cy={node.y}
              r={selected ? 22 : 18}
              fill={selected ? '#1f9d6b' : node.color || '#2f6fdb'}
              stroke="#fff"
              strokeWidth="3"
            />
            <text x={node.x} y={node.y} className="glabel" style={{ fontSize: 14 }}>
              {node.label || node.id}
            </text>
            {showDegrees && degree && (
              <text x={node.x} y={node.y - 30} className="gtag" textAnchor="middle" fill="#516074">
                d={degree.total}
              </text>
            )}
            {showDirectedDegrees && degree && (
              <text x={node.x} y={node.y - 30} className="gtag" textAnchor="middle" fill="#516074">
                +{degree.out}/-{degree.in}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function FormulaPill({ tex }: { tex: string }) {
  return (
    <div className="mt-3 inline-flex rounded-xl bg-navy px-4 py-2 font-mono text-sm text-sky-100">
      <RichText text={`$${tex}$`} />
    </div>
  );
}
