"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { CircleAlert, CircleCheck, Info, LoaderCircle, TriangleAlert, X } from "lucide-react";
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
        <Toaster
          className="app-toaster"
          position="top-center"
          richColors
          expand
          closeButton
          duration={6500}
          gap={12}
          visibleToasts={4}
          offset={{ top: 20 }}
          mobileOffset={{ top: 12, left: 12, right: 12 }}
          swipeDirections={["top", "right"]}
          containerAriaLabel="Thông báo trạng thái"
          icons={{
            success: <CircleCheck aria-hidden="true" size={23} strokeWidth={2.6} />,
            error: <CircleAlert aria-hidden="true" size={23} strokeWidth={2.6} />,
            warning: <TriangleAlert aria-hidden="true" size={22} strokeWidth={2.6} />,
            info: <Info aria-hidden="true" size={23} strokeWidth={2.6} />,
            loading: (
              <LoaderCircle aria-hidden="true" className="app-toast__spinner" size={22} strokeWidth={2.5} />
            ),
            close: <X aria-hidden="true" size={16} strokeWidth={2.6} />,
          }}
          toastOptions={{
            classNames: {
              toast: "app-toast",
              content: "app-toast__content",
              title: "app-toast__title",
              description: "app-toast__description",
              icon: "app-toast__icon",
              closeButton: "app-toast__close",
              success: "app-toast--success",
              error: "app-toast--error",
              warning: "app-toast--warning",
              info: "app-toast--info",
              loading: "app-toast--loading",
            },
          }}
        />
      </MotionConfig>
    </QueryClientProvider>
  );
}
