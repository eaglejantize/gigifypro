export default function BuildTag() {
  const ts = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  
  return (
    <div 
      className="fixed bottom-2 right-2 rounded bg-black/70 text-white text-xs px-2 py-1 z-50 pointer-events-none"
      data-testid="build-tag"
    >
      GP Build · {ts}
    </div>
  );
}
