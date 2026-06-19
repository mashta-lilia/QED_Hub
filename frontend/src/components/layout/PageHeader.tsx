import type { PageDescriptor, PageKind } from '../../types';

const KIND_LABEL: Record<PageKind, string> = {
  theory: 'Теорія',
  theorem: 'Теорема',
  interactive: 'Інтерактив',
  practice: 'Практика',
};

interface PageHeaderProps {
  page: PageDescriptor;
  idx: number;
  total: number;
  modeLabel: string;
}

export function PageHeader({ page, idx, total, modeLabel }: PageHeaderProps) {
  return (
    <div className="ph">
      <div className="ph-row">
        <span className={'ph-kind k-' + page.kind}>{KIND_LABEL[page.kind]}</span>
        <span className="ph-step">
          {modeLabel} · {idx + 1} / {total}
        </span>
      </div>
      <h1 className="ph-title">{page.title}</h1>
      {page.lead && <p className="ph-lead">{page.lead}</p>}
    </div>
  );
}
