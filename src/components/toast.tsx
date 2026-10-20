import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Icon } from "./icon";
type Notice = { id: number; message: string; error: boolean };
const Context = createContext<(message: string, error?: boolean) => void>(
  () => {},
);
function Toast({
  notice,
  dismiss,
}: {
  notice: Notice;
  dismiss: (id: number) => void;
}) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => dismiss(notice.id), 6000);
    return () => window.clearTimeout(timer);
  }, [paused, notice.id, dismiss]);
  return (
    <div
      className={`toast ${notice.error ? "toast-error" : ""}`}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setPaused(false);
      }}
    >
      <span className="toast-icon">
        <Icon name={notice.error ? "close" : "check"} />
      </span>
      <span>{notice.message}</span>
      <button
        type="button"
        className="icon-button"
        aria-label="Dismiss notification"
        onClick={() => dismiss(notice.id)}
      >
        <Icon name="close" size={15} />
      </button>
    </div>
  );
}
export function ToastProvider({ children }: { children: ReactNode }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const nextId = useRef(0);
  const notify = useCallback((message: string, error = false) => {
    const id = ++nextId.current;
    setNotices((current) => [...current.slice(-2), { id, message, error }]);
  }, []);
  const dismiss = useCallback(
    (id: number) =>
      setNotices((current) => current.filter((notice) => notice.id !== id)),
    [],
  );
  return (
    <Context.Provider value={notify}>
      {children}
      <div className="toast-region" role="region" aria-label="Notifications">
        {notices.map((notice) => (
          <Toast key={notice.id} notice={notice} dismiss={dismiss} />
        ))}
      </div>
    </Context.Provider>
  );
}
export function useToast() {
  return useContext(Context);
}
