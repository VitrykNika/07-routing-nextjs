import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { Note } from '@/types/note';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://notehub-public.goit.study/api';
const TOKEN = process.env.NEXT_PUBLIC_NOTEHUB_TOKEN as string | undefined;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  if (TOKEN) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${TOKEN}`;
  }
  return config;
});

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

function unwrapArray<T extends object>(resData: ApiEnvelope<T[]>): T[] {
  return resData.data ?? resData.notes ?? resData.items ?? resData.results ?? [];
}

function unwrapItem<T extends object>(resData: ApiEnvelope<T>): T {
  return resData.data ?? (resData as T);
}

export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface FetchNotesResult {
  results: Note[];   
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
}

export async function fetchNotes(params: FetchNotesParams): Promise<FetchNotesResult> {
  const { page = 1, perPage = 12, search } = params;

  const resp: AxiosResponse<ApiEnvelope<Note[]>> = await api.get('/notes', {
    params: { page, perPage, ...(search?.trim() ? { search: search.trim() } : {}) },
  });

  const src = resp.data ?? {};
  const arr = unwrapArray(src);

  const pageNum = Number(src.page ?? page);
  const per = Number(src.perPage ?? perPage);
  const totalItems = Number(src.totalItems ?? src.total ?? arr.length);
  const totalPages = Number(src.totalPages ?? Math.max(1, Math.ceil(totalItems / per)));

  return { results: arr, page: pageNum, perPage: per, totalPages, totalItems };
}

export interface CreateNotePayload {
  title: string;
  content?: string;
}

export async function createNote(payload: CreateNotePayload): Promise<Note> {
  const resp: AxiosResponse<ApiEnvelope<Note>> = await api.post('/notes', payload);
  return unwrapItem(resp.data ?? {});
}

export async function deleteNote(id: string): Promise<Note> {
  const resp: AxiosResponse<ApiEnvelope<Note>> = await api.delete(`/notes/${id}`);
  return unwrapItem(resp.data ?? {});
}

export async function fetchNoteById(id: number | string): Promise<Note> {
  const resp: AxiosResponse<ApiEnvelope<Note>> = await api.get(`/notes/${id}`);
  return unwrapItem(resp.data ?? {});
}