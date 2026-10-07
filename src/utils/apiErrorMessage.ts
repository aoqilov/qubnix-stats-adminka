import axios from "axios";
import i18n from "@/i18n";
import { MockApiError } from "@/api-config/mock";

/** Xato HTTP statusi — backend (axios) va mock xatolari uchun bir xil. */
export function getApiErrorStatus(err: unknown): number | undefined {
  if (err instanceof MockApiError) return err.status;
  if (axios.isAxiosError(err)) return err.response?.status;
  return undefined;
}

/** Backend `message` bersa — o'sha, aks holda joriy tildagi umumiy matn. */
export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (typeof message === "string" && message) return message;
  }
  return i18n.t("common.states.actionError");
}
