"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface FilterTypes {
  search?: string;
  category?: string;
  date?: string;
}

interface NavSearchBarProps {
  placeholder?: string;
  color?: string;
  className?: string;
  onSearch?: (query: string) => void;
  filterState?: FilterTypes;
  setFilters?: (newFilters: Partial<FilterTypes>) => void;
  value?: string;
  disabled?: boolean;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  inputRef?: React.Ref<HTMLInputElement>;
}

const NavSearchBar = ({
  placeholder = "Search",
  color,
  className,
  onSearch,
  filterState,
  setFilters,
  value,
  disabled = false,
  onKeyDown,
  inputRef,
}: NavSearchBarProps) => {
  const [internal, setInternal] = React.useState(value ?? "");

  const current = filterState?.search ?? value ?? internal;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setInternal(next);
    onSearch?.(next);
    setFilters?.({ search: next });
  };

  return (
    <div
      data-slot="nav-search-bar"
      className={cn(
        "flex h-[50px] w-full max-w-[339px] items-center gap-[10px] rounded-[30px] px-[25px] py-2",
        "bg-[#FFFFFFB5] shadow-[0px_0px_4px_0px_#00000040]",
        "transition-shadow focus-within:shadow-[0px_0px_0px_2px_#6E2D6B66]",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
    >
      <Search aria-hidden="true" className="size-[22px] shrink-0 text-black" />
      <input
        ref={inputRef}
        type="text"
        aria-label={placeholder}
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        value={current}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        style={color ? { color } : undefined}
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent outline-none",
          "text-[16px] font-normal leading-[100%] tracking-[0%] text-black",
          "placeholder:text-[16px] placeholder:font-normal placeholder:text-[#484848]",
          "disabled:cursor-not-allowed"
        )}
      />
    </div>
  );
};

export default NavSearchBar;