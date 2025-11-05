import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import type { Note, NoteTag } from "@/types/note";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://notehub-public.goit.study/api";
const TOKEN = process.env.NEXT_PUBLIC_NOTEHUB_TOKEN;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  if (TOKEN) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${TOKEN.trim()}`;
  }
  return config;
});

export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: string;
}

export interface FetchNotesResult {
  results: Note[];
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
}

export interface CreateNoteParams {
  title: string;
  content?: string;
  tag: NoteTag; 
}

interface ApiEnvelope<T> {
  data?: T;
  notes?: T;
  items?: T;
  results?: T;
  page?: number;
  perPage?: number;
  totalItems?: number;
  totalPages?: number;
  total?: number;
}

function unwrapArray<T>(src: ApiEnvelope<T[]>): T[] {
  return src.data ?? src.notes ?? src.items ?? src.results ?? [];
}
function unwrapItem<T>(src: ApiEnvelope<T>): T {
  return src.data ?? (src as T);
}

export async function fetchNotes({
  page = 1,
  perPage = 12,
  search,
  tag,
}: FetchNotesParams): Promise<FetchNotesResult> {
  const safeTag =
    tag && tag.toLowerCase() !== "all" ? tag : undefined;

  const resp: AxiosResponse<ApiEnvelope<Note[]>> = await api.get("/notes", {
    params: {
      page,
      perPage,
      ...(search?.trim() ? { search: search.trim() } : {}),
      ...(safeTag ? { tag: safeTag } : {}),
    },
  });

  const src = resp.data;
  const results = unwrapArray(src);
  const pageNum = Number(src.page ?? page);
  const per = Number(src.perPage ?? perPage);
  const totalItems = Number(src.totalItems ?? src.total ?? results.length);
  const totalPages = Number(src.totalPages ?? Math.max(1, Math.ceil(totalItems / per)));

  return { results, page: pageNum, perPage: per, totalPages, totalItems };
}

export async function fetchNoteById(id: string): Promise<Note> {
  if (!id) throw new Error("Note id is required");
  const resp: AxiosResponse<ApiEnvelope<Note>> = await api.get(`/notes/${id}`);
  return unwrapItem(resp.data);
}

export async function createNote(payload: CreateNoteParams): Promise<Note> {
  const resp = await api.post<ApiEnvelope<Note>>("/notes", payload);
  return unwrapItem(resp.data);
}

export async function deleteNote(id: string): Promise<Note> {
  const resp = await api.delete<ApiEnvelope<Note>>(`/notes/${id}`);
  return unwrapItem(resp.data);
}