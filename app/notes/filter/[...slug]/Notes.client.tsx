"use client";
import { useState, useEffect } from "react";
import css from "../../page.module.css";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import { fetchNotes } from "@/lib/api";
import NoteList from "@/components/NoteList/NoteList";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import Modal from "@/components/Modal/Modal";
import NoteForm from "@/components/NoteForm/NoteForm";
import Loading from "@/app/loading";
import Error from "./error";

type NotesClientProps = { initialTag?: string };

export default function NotesClient({ initialTag = "" }: NotesClientProps) {
  const [page, setPage] = useState(1);
  const [topic, setTopic] = useState("");

  const tag = initialTag; 

  const { data, isLoading, isError, isSuccess, error } = useQuery({
    queryKey: ["notes", topic, page, { tag }], 
    queryFn: () => fetchNotes({ search: topic, page, tag: tag || undefined }), 
    placeholderData: keepPreviousData,
    refetchOnMount: false,
  });

  useEffect(() => { setPage(1); }, [initialTag]);

  const handleSearch = useDebouncedCallback((q: string) => {
    setTopic(q);
    setPage(1);
  }, 600);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox onSearch={handleSearch} searchQuery={topic} />
        {isSuccess && data.totalPages > 1 && (
          <Pagination
            totalPages={data.totalPages}
            currentPage={page}
            onPageChange={(p) => setPage(p)}
          />
        )}
        <button className={css.button} onClick={openModal}>
          Create note +
        </button>
      </header>

      {isLoading && <Loading />}
      {isError && <Error error={error} />}
      {isSuccess && <NoteList notes={data.results} />}

      {isModalOpen && (
        <Modal onClose={closeModal}>
          <NoteForm onClose={closeModal} />
        </Modal>
      )}
    </div>
  );
}