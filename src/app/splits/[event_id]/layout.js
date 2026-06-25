export default function EventSplitLayout({ children }) {
  return (
    <div className="fixed inset-0 bg-[#E2EFF6] overflow-y-auto z-[999]">
      {children}
    </div>
  );
}
