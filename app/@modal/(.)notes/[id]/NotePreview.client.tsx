"use client";
import Modal from "@/components/Modal/Modal";
import css from "./NoteDetails.module.css";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchNoteById } from "@/lib/api";
import Loading from "@/app/loading";

export default function NotePreview() {
  const router = useRouter();
  const { id } = useParams<{ id?: string }>();

  const enabled = Boolean(id);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["note", id ?? ""],     
    queryFn: () => fetchNoteById(id as string),
    enabled,                        
    refetchOnMount: false,
  });

  if (!enabled) return null;

  const close = () => router.back();

  return (
    <Modal onClose={close}>
      {isLoading && <Loading />}
      {isError && <p>Could not fetch note details.</p>}
      {data && (
        <div className={css.container}>
          <div className={css.item}>
            <div className={css.header}><h2>{data.title}</h2></div>
            <p className={css.content}>{data.content}</p>
            <p className={css.date}>{data.createdAt}</p>
          </div>
          <span className={css.tag}>{data.tag}</span>
        </div>
      )}
      <button onClick={close} className={css.backBtn}>Close</button>
    </Modal>
  );
}