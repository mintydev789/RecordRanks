import type { HTMLAttributes } from "react";

type Props = {
  children: React.ReactNode;
} & HTMLAttributes<HTMLDivElement>;

function FiltersContainer({ children, className }: Props) {
  return <div className={`d-flex column-gap-3 row-gap-2 flex-wrap align-items-center ${className}`}>{children}</div>;
}

export default FiltersContainer;
