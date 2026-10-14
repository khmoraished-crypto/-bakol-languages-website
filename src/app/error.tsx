"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-primary">حدث خطأ غير متوقع</h1>
      <p className="mt-3 leading-8 text-muted-foreground">نعتذر عن ذلك. يمكنك إعادة المحاولة، ومسوداتك المحفوظة في المتصفح لم تتأثر.</p>
      <Button variant="accent" className="mt-8" onClick={reset}>
        إعادة المحاولة
      </Button>
    </div>
  );
}
