import { useCallback, useMemo, useRef, useState } from "react";
import {
    commitEditorHistory,
    createEditorHistory,
    DEFAULT_HISTORY_LIMIT,
    redoEditorHistory,
    reorderArray,
    undoEditorHistory,
} from "../utils/editorHistory";

type ReorderPayload = { from: number; to: number };

export function useEditorHistory<T>(initialValue: T[], limit = DEFAULT_HISTORY_LIMIT) {
    const [history, setHistory] = useState(() => createEditorHistory(initialValue));
    const lastCoalesce = useRef<{ key: string; timestamp: number } | null>(null);

    const commit = useCallback(
        (nextValue: T[], coalesceKey?: string) => {
            const now = Date.now();
            const shouldCoalesce = Boolean(
                coalesceKey &&
                lastCoalesce.current?.key === coalesceKey &&
                now - lastCoalesce.current.timestamp < 600,
            );

            lastCoalesce.current = coalesceKey ? { key: coalesceKey, timestamp: now } : null;
            setHistory((current) =>
                commitEditorHistory(current, nextValue, { coalesce: shouldCoalesce, limit }),
            );
        },
        [limit],
    );

    const setState = useCallback((nextValue: T[]) => commit([...nextValue]), [commit]);
    const replaceState = useCallback((nextValue: T[]) => {
        lastCoalesce.current = null;
        setHistory(createEditorHistory([...nextValue]));
    }, []);

    const handlers = useMemo(
        () => ({
            setState,
            replaceState,
            append: (item: T) => commit([...history.present, item]),
            remove: (index: number) => {
                if (index < 0 || index >= history.present.length) return;
                commit(history.present.filter((_, itemIndex) => itemIndex !== index));
            },
            reorder: ({ from, to }: ReorderPayload) =>
                commit(reorderArray(history.present, from, to)),
            setItem: (index: number, item: T, coalesceKey?: string) => {
                if (index < 0 || index >= history.present.length) return;
                const next = [...history.present];
                next[index] = item;
                commit(next, coalesceKey);
            },
            setItemProp: <K extends keyof T>(
                index: number,
                property: K,
                value: T[K],
                coalesceKey?: string,
            ) => {
                if (index < 0 || index >= history.present.length) return;
                const next = [...history.present];
                next[index] = { ...next[index], [property]: value };
                commit(next, coalesceKey ?? `${index}:${String(property)}`);
            },
        }),
        [commit, history.present, replaceState, setState],
    );

    const undo = useCallback(() => {
        lastCoalesce.current = null;
        setHistory(undoEditorHistory);
    }, []);

    const redo = useCallback(() => {
        lastCoalesce.current = null;
        setHistory(redoEditorHistory);
    }, []);

    return {
        state: history.present,
        handlers,
        undo,
        redo,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
    };
}
