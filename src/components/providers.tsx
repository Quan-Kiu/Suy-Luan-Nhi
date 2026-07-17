"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { useState } from "react";
import { Toaster } from "sonner";
import { createAppQueryClient } from "@/lib/query/client";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createAppQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.22, ease: "easeOut" }}>
        {children}
        <Toaster position="top-center" richColors />
      </MotionConfig>
    </QueryClientProvider>
  );
}
