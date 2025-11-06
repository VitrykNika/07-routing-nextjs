import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import NotesClient from "./Notes.client";
import { fetchNotes } from "@/lib/api";

type Params = Promise<{ slug: string[] }>;

export default async function FilteredNotesPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const tagParam = slug?.[0]; 
  const effectiveTag =
    !tagParam || tagParam.toLowerCase() === "all" ? undefined : tagParam;

  const qc = new QueryClient();
  await qc.prefetchQuery({
    queryKey: ["notes", "", 1, { tag: effectiveTag }],
    queryFn: () => fetchNotes({ search: "", page: 1, tag: effectiveTag }),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
       <NotesClient key={effectiveTag ?? "all"} initialTag={effectiveTag ?? ""} />
    </HydrationBoundary>
  );
}