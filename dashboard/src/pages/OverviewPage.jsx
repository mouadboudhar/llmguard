import TopBar from '../components/TopBar';

export default function OverviewPage() {
  return (
    <>
      <TopBar title="Overview" />
      <div className="flex-1 overflow-y-auto p-6" style={{ color: 'var(--text-3)' }}>
        Overview — coming in Group 2
      </div>
    </>
  );
}
