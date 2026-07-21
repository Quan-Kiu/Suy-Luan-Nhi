import { cn } from "@/lib/utils";

export function ChildShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="min-h-screen bg-[#efe5d2] px-0 sm:px-6 sm:py-8">
      <div
        className={cn(
          "mx-auto min-h-screen w-full max-w-[470px] overflow-x-clip bg-[#fffaf0] shadow-2xl sm:min-h-[calc(100vh-4rem)] sm:rounded-[36px]",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
