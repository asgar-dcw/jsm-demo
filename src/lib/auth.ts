import type { NavigateFunction } from 'react-router-dom';
import { toast } from 'sonner';

const SIGNED_OUT_KEY = 'schedulemate_signed_out';

/** Marks session as signed out and returns to home. Wire real auth (clear tokens) here later. */
export function performSignOut(navigate: NavigateFunction) {
  try {
    sessionStorage.setItem(SIGNED_OUT_KEY, '1');
  } catch {
    /* ignore */
  }
  toast.success('Signed out');
  navigate('/');
}

export function isSignedOutFlag(): boolean {
  try {
    return sessionStorage.getItem(SIGNED_OUT_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearSignedOutFlag() {
  try {
    sessionStorage.removeItem(SIGNED_OUT_KEY);
  } catch {
    /* ignore */
  }
}
