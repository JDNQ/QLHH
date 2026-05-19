"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

import { listingService } from "@/services/listing.service";
import type { CreateListingData, ListingsQuery, UpdateListingData } from "@/types";

export const LISTING_KEYS = {
  all: ["listings"] as const,
  list: (params: ListingsQuery) => ["listings", params] as const,
  detail: (id: string) => ["listing", id] as const,
  mine: (params: ListingsQuery) => ["my-listings", params] as const,
};

export function useListings(params: ListingsQuery = {}) {
  return useQuery({
    queryKey: LISTING_KEYS.list(params),
    queryFn: () => listingService.getListings(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useListingDetail(id: string) {
  return useQuery({
    queryKey: LISTING_KEYS.detail(id),
    queryFn: () => listingService.getListingById(id),
    enabled: !!id,
  });
}

export function useMyListings(params: ListingsQuery = {}) {
  return useQuery({
    queryKey: LISTING_KEYS.mine(params),
    queryFn: () => listingService.getMyListings(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateListing() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateListingData) => listingService.createListing(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LISTING_KEYS.all });
      qc.invalidateQueries({ queryKey: ["my-listings"] });
      toast.success("Dang tin thanh cong, cho duyet");
    },
    onError: (err: any) => toast.error(err?.message ?? "Dang tin that bai"),
  });
}

export function useUpdateListing() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateListingData }) =>
      listingService.updateListing(id, data),
    onSuccess: (listing) => {
      qc.invalidateQueries({ queryKey: LISTING_KEYS.all });
      qc.invalidateQueries({ queryKey: LISTING_KEYS.detail(listing.id) });
      toast.success("Cap nhat thanh cong");
    },
    onError: (err: any) => toast.error(err?.message ?? "Cap nhat that bai"),
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => listingService.deleteListing(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LISTING_KEYS.all });
      toast.success("Da xoa bai viet");
    },
    onError: (err: any) => toast.error(err?.message ?? "Xoa that bai"),
  });
}

export function useBumpListing() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => listingService.bumpListing(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LISTING_KEYS.all });
      toast.success("Da day tin");
    },
  });
}
