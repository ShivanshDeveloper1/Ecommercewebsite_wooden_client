import type { ComponentProps } from "react";

export default function PageContainer({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`section-wrap ${className}`.trim()} {...props} />;
}
