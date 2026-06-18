export type GT01Section = 'theory' | 'theorems' | 'practice';

const tabs: { id: GT01Section; label: string; hint: string }[] = [
  { id: 'theory', label: 'Теорія', hint: 'Означення і нотація' },
  { id: 'theorems', label: 'Теореми', hint: 'Леми, наслідки, докази' },
  { id: 'practice', label: 'Практика', hint: 'Завдання з перевіркою' },
];

export function GT01SectionTabs({
  activeTab,
  onSelect,
}: {
  activeTab: GT01Section;
  onSelect: (tab: GT01Section) => void;
}) {
  return (
    <nav className="grid gap-3 md:grid-cols-3" aria-label="Розділи GT-01">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={[
              'flex min-h-[64px] flex-1 flex-col justify-center rounded-2xl border px-4 py-3 text-left transition',
              active
                ? 'border-accent bg-accent text-white shadow'
                : 'border-line bg-white text-navy shadow-sm hover:border-accent/50 hover:bg-accent/5',
            ].join(' ')}
          >
            <span className="font-head text-base font-extrabold leading-tight">{tab.label}</span>
            <span className={active ? 'mt-1 text-xs leading-4 text-white/80' : 'mt-1 text-xs leading-4 text-slate-500'}>
              {tab.hint}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
