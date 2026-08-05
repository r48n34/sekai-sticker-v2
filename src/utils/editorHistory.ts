export const DEFAULT_HISTORY_LIMIT = 50;

export interface EditorHistory<T> {
    past: T[];
    present: T;
    future: T[];
}

export function createEditorHistory<T>(initialValue: T): EditorHistory<T> {
    return {
        past: [],
        present: initialValue,
        future: [],
    };
}

export function commitEditorHistory<T>(
    history: EditorHistory<T>,
    nextValue: T,
    options: { coalesce?: boolean; limit?: number } = {},
): EditorHistory<T> {
    if (Object.is(history.present, nextValue)) {
        return history;
    }

    const limit = options.limit ?? DEFAULT_HISTORY_LIMIT;
    const past = options.coalesce ? history.past : [...history.past, history.present].slice(-limit);

    return {
        past,
        present: nextValue,
        future: [],
    };
}

export function undoEditorHistory<T>(history: EditorHistory<T>): EditorHistory<T> {
    const previous = history.past[history.past.length - 1];

    if (previous === undefined) {
        return history;
    }

    return {
        past: history.past.slice(0, -1),
        present: previous,
        future: [history.present, ...history.future],
    };
}

export function redoEditorHistory<T>(history: EditorHistory<T>): EditorHistory<T> {
    const next = history.future[0];

    if (next === undefined) {
        return history;
    }

    return {
        past: [...history.past, history.present],
        present: next,
        future: history.future.slice(1),
    };
}

export function reorderArray<T>(items: T[], from: number, to: number): T[] {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
        return items;
    }

    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
}
