"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import css from "./SidebarNotes.module.css";

const TAGS = ["Work", "Personal", "Meeting", "Shopping", "Todo"];

export default function SidebarNotes() {
  const pathname = usePathname();

  const parts = pathname.split("/").filter(Boolean); 
  const current =
    parts[0] === "notes" && parts[1] === "filter" ? (parts[2] ?? "all") : "all";

  const isActive = (tag: string) => current.toLowerCase() === tag.toLowerCase();

  return (
    <ul className={css.menuList}>
      <li className={css.menuItem}>
        <Link
          href="/notes/filter/all"
          className={`${css.menuLink} ${isActive("all") ? css.active : ""}`}
          aria-current={isActive("all") ? "page" : undefined}
        >
          All notes
        </Link>
      </li>

      {TAGS.map((t) => (
        <li key={t} className={css.menuItem}>
          <Link
            href={`/notes/filter/${encodeURIComponent(t)}`}
            className={`${css.menuLink} ${isActive(t) ? css.active : ""}`}
            aria-current={isActive(t) ? "page" : undefined}
          >
            {t}
          </Link>
        </li>
      ))}
    </ul>
  );
}