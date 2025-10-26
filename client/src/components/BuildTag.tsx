export default function BuildTag() {
  const buildDate = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  return (
    <div 
      className="fixed bottom-2 right-2 z-50 rounded bg-black/75 text-white text-xs px-2 py-1 pointer-events-none select-none"
      data-testid="build-tag"
    >
      GP Build · {buildDate}
    </div>
  );
}
