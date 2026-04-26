export default function BackgroundMesh() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="mesh-blob mesh-blob-cyan absolute left-[-160px] top-[-180px] h-[600px] w-[600px] rounded-full bg-[rgba(0,212,255,0.06)] blur-[120px]" />
      <div className="mesh-blob mesh-blob-violet absolute bottom-[-160px] right-[-150px] h-[500px] w-[500px] rounded-full bg-[rgba(124,58,237,0.08)] blur-[100px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,212,255,0.08),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.1),transparent_32%)]" />
    </div>
  );
}
