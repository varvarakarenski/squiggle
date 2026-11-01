// Watches VS Code's diagnostics and explains each new error with the core,
// which is bundled into the extension and runs in-process.
//
// Every VS Code gotcha (0-based lines, backslash paths, repeated diagnostics)
// is handled below.

import * as vscode from 'vscode';
import type { ErrorReportedMessage } from '../../protocol/src/index';
import { onFileSaved, onError } from '../../core/src/pipeline';
import { toDisplay, toPanelMessages } from '../../core/src/render';

// Hold off while the user is typing: `pri`, `prit`, `pritn` are each a different
// "error" mid-word. Only check a file once it's been quiet this long (or on save).
// Read on every keystroke, so changing it in Settings applies immediately.
const typingIdleMs = () =>
  vscode.workspace.getConfiguration('squiggle').get<number>('patience', 1500);

export type Watcher = { stop: () => void };

// A card's id. Stable for the same error, which lets the panel update an existing
// card instead of stacking a new one every time you type.
export const diagnosticId = (uri: vscode.Uri, d: vscode.Diagnostic) =>
  [uri.fsPath, d.range.start.line + 1, d.range.start.character + 1, d.message].join(':');

export function watchDiagnostics(post: (message: any) => void): Watcher {
  // Per file: the diagnostics we have already explained (key -> errorId), so that
  // typing in a file does not re-explain every squiggle it already has, and so we
  // know which cards to remove once their error is gone.
  const reported = new Map<string, Map<string, string>>();
  const active = () => new Set([...reported.values()].flatMap((m) => [...m.values()]));

  const keyFor = (d: vscode.Diagnostic) =>
    (d.range.start.line + 1) + ':' + (d.range.start.character + 1) + ':' + d.message;

  const explainDiagnostic = async (doc: vscode.TextDocument, d: vscode.Diagnostic) => {
    // VS Code counts lines and columns from 0. The core counts from 1.
    const config = vscode.workspace.getConfiguration('squiggle');
    const around = config.get<number>('contextLines', 10);
    const first = Math.max(0, d.range.start.line - around);
    const last = Math.min(doc.lineCount - 1, d.range.start.line + around);

    const report: ErrorReportedMessage = {
      type: 'error.reported',
      errorId: diagnosticId(doc.uri, d),
      message: d.message,
      file: doc.uri.fsPath,
      line: d.range.start.line + 1,
      column: d.range.start.character + 1,
      language: doc.languageId,     // 'python', 'typescriptreact', ...
      severity: d.severity === vscode.DiagnosticSeverity.Error ? 'error' : 'warning',
      source: d.source,             // 'Pylance', 'ts(2339)', ...
      narration: config.get<number>('narration', 33),
      lineText: doc.lineAt(d.range.start.line).text,   // lets the core hand back this exact line, fixed
      context: around ? doc.getText(new vscode.Range(first, 0, last, doc.lineAt(last).text.length)) : '',
    };

    // No extra wait in the core: `patience` above already waited for typing to stop.
    // onError never rejects; a failure comes back as a fallback explanation.
    const explanation = await onError(report, 0);

    // Skip answers for errors that were fixed while the core was thinking.
    const live = active();
    for (const m of toPanelMessages(toDisplay(report, explanation), report.errorId))
      if (live.has(m.id)) post(m);
  };

  const syncUri = (uri: vscode.Uri) => {
    const doc = vscode.workspace.textDocuments.find(
      (t) => t.uri.toString() === uri.toString(),
    );
    if (!doc) return;

    const errors = vscode.languages
      .getDiagnostics(uri)
      // Warnings too: Pylance reports misspelled names (`pritn`) as warnings, the classic beginner mistake.
      .filter((d) => d.severity <= vscode.DiagnosticSeverity.Warning);

    const previous = reported.get(uri.toString()) ?? new Map<string, string>();
    const current = new Map<string, string>();

    for (const d of errors) {
      const key = keyFor(d);
      current.set(key, diagnosticId(doc.uri, d));
      if (!previous.has(key)) explainDiagnostic(doc, d);
    }

    // Errors that are gone (fixed, or a half-typed word that got finished): drop their cards.
    for (const [key, id] of previous) if (!current.has(key)) post({ type: 'resolve', id });

    reported.set(uri.toString(), current);
  };

  // Files the user is typing in, each with a timer that checks it once they stop.
  const typing = new Map<string, ReturnType<typeof setTimeout>>();

  const settle = (uri: vscode.Uri) => {
    clearTimeout(typing.get(uri.toString()));
    typing.delete(uri.toString());
    syncUri(uri);
  };

  const subscriptions = [
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.contentChanges.length === 0) return;
      const key = e.document.uri.toString();
      clearTimeout(typing.get(key));
      typing.set(key, setTimeout(() => settle(e.document.uri), typingIdleMs()));
    }),
    vscode.workspace.onDidSaveTextDocument((doc) => {
      onFileSaved(doc.uri.fsPath);
      settle(doc.uri); // saving means "I'm done typing"
    }),
    vscode.languages.onDidChangeDiagnostics((e) => {
      // Mid-typing files wait for their timer; everything else syncs right away.
      for (const uri of e.uris) if (!typing.has(uri.toString())) syncUri(uri);
    }),
  ];

  // Catch up on whatever is already broken on screen.
  for (const [uri] of vscode.languages.getDiagnostics()) syncUri(uri);

  return {
    stop() {
      for (const t of typing.values()) clearTimeout(t);
      for (const s of subscriptions) s.dispose();
    },
  };
}
