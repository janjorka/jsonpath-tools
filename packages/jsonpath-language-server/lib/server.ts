import { CompletionItemTextType, CompletionItemType, DiagnosticsSeverity, EditorService, TextChange, TextRange, type CompletionItem as EditorCompletionItem, type JSONValue } from "@jsonpath-tools/jsonpath";
import { TextDocument } from "vscode-languageserver-textdocument";
import { CompletionItemKind, createConnection, DiagnosticSeverity, DidChangeConfigurationNotification, DocumentDiagnosticReportKind, DocumentHighlightKind, InsertTextFormat, MarkupKind, ProposedFeatures, Range, TextDocumentSyncKind, TextEdit, type CompletionItem as LspCompletionItem, type DocumentHighlight as LspDocumentHighlight, type ParameterInformation } from "vscode-languageserver/node";

type EditorDocument = {
    textDocument: TextDocument,
    editorService: EditorService,
    lastCompletionItems: readonly EditorCompletionItem[]
};

const connection = createConnection(ProposedFeatures.all);
const documentURIToEditorDocument = new Map<string, EditorDocument>();
let hasConfigurationCapability = false;

connection.onInitialize(params => {
    hasConfigurationCapability = params.capabilities.workspace?.configuration === true;
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: [".", "[", "(", '"', "'", "?"]
            },
            diagnosticProvider: {
                identifier: "jsonpath",
                interFileDependencies: false,
                workspaceDiagnostics: false
            },
            signatureHelpProvider: {
                triggerCharacters: ["(", ","],
                retriggerCharacters: [")"]
            },
            hoverProvider: true,
            documentFormattingProvider: true,
            documentHighlightProvider: true
        },
        serverInfo: {
            name: "jsonpath-language-server",
            version: JSONPATH_TOOLS_VERSION,
        }
    };
});

connection.onInitialized(params => {
    if (hasConfigurationCapability)
        connection.client.register(DidChangeConfigurationNotification.type, { section: "jsonpath" });
});

connection.onDidChangeConfiguration(params => {
    for (const documentURI of documentURIToEditorDocument.keys())
        updateDocumentConfiguration(documentURI);
});

connection.onDidOpenTextDocument(params => {
    const textDocument = TextDocument.create(params.textDocument.uri, params.textDocument.languageId, params.textDocument.version, params.textDocument.text);
    const editorService = new EditorService();
    editorService.updateQuery(textDocument.getText());
    documentURIToEditorDocument.set(textDocument.uri, { textDocument, editorService, lastCompletionItems: [] });
    updateDocumentConfiguration(textDocument.uri);
});

connection.onDidChangeTextDocument(params => {
    const editorDocument = documentURIToEditorDocument.get(params.textDocument.uri);
    if (editorDocument === undefined)
        return;
    for (const change of params.contentChanges) {
        if ("range" in change) {
            const startPosition = editorDocument.textDocument.offsetAt(change.range.start);
            const endPosition = editorDocument.textDocument.offsetAt(change.range.end);
            const textRange = new TextRange(startPosition, endPosition - startPosition);
            const textChange = new TextChange(textRange, change.text);
            editorDocument.editorService.updateQueryPartial([textChange]);
        }
        else
            editorDocument.editorService.updateQuery(change.text);
        editorDocument.textDocument = TextDocument.update(editorDocument.textDocument, [change], params.textDocument.version);
    }
});

connection.onDidCloseTextDocument(params => {
    documentURIToEditorDocument.delete(params.textDocument.uri);
});

connection.onCompletion(params => {
    const editorDocument = documentURIToEditorDocument.get(params.textDocument.uri);
    if (editorDocument === undefined)
        return null;
    const position = editorDocument.textDocument.offsetAt(params.position);
    const completions = editorDocument.editorService.getCompletions(position);
    editorDocument.lastCompletionItems = completions;
    return completions.map((item, index): LspCompletionItem => {
        const textEdit = TextEdit.replace(
            toLSPRange(editorDocument.textDocument, item.range),
            item.textType === CompletionItemTextType.snippet ? toLSPSnippetText(item.text) : item.text
        );
        return {
            label: item.label,
            kind: toLSPCompletionItemKind(item.type),
            detail: item.detail,
            insertTextFormat: item.textType === CompletionItemTextType.snippet ? InsertTextFormat.Snippet : InsertTextFormat.PlainText,
            textEdit: textEdit,
            data: { 
                uri: editorDocument.textDocument.uri, 
                index 
            }
        };
    });
});

connection.onCompletionResolve(item => {
    const data = item.data as { uri: string; index: number } | undefined;
    if (data === undefined)
        return item;
    const editorDocument = documentURIToEditorDocument.get(data.uri);
    if (editorDocument === undefined)
        return item;
    const completion = editorDocument.lastCompletionItems[data.index];
    if (completion.resolveDescription !== undefined) {
        item.documentation = {
            kind: MarkupKind.Markdown,
            value: completion.resolveDescription()
        };
    }
    return item;
});

connection.onDocumentHighlight(params => {
    const editorDocument = documentURIToEditorDocument.get(params.textDocument.uri);
    if (editorDocument === undefined)
        return null;
    const position = editorDocument.textDocument.offsetAt(params.position);
    const documentHighlights = editorDocument.editorService.getDocumentHighlights(position);
    return documentHighlights.map((dh): LspDocumentHighlight => ({
        range: toLSPRange(editorDocument.textDocument, dh.range),
        kind: DocumentHighlightKind.Text
    }));
});

connection.onDocumentFormatting(params => {
    const editorDocument = documentURIToEditorDocument.get(params.textDocument.uri);
    if (editorDocument === undefined)
        return null;
    const formattingEdits = editorDocument.editorService.getFormattingEdits();
    return formattingEdits.map(edit =>
        TextEdit.replace(toLSPRange(editorDocument.textDocument, edit.range), edit.newText)
    );
});

connection.onHover(params => {
    const editorDocument = documentURIToEditorDocument.get(params.textDocument.uri);
    if (editorDocument === undefined)
        return null;
    const position = editorDocument.textDocument.offsetAt(params.position);
    const tooltip = editorDocument.editorService.getTooltip(position);
    if (tooltip === null)
        return null;
    return {
        contents: {
            kind: MarkupKind.Markdown,
            value: tooltip.text
        },
        range: toLSPRange(editorDocument.textDocument, tooltip.range)
    };
});

connection.onSignatureHelp(params => {
    const editorDocument = documentURIToEditorDocument.get(params.textDocument.uri);
    if (editorDocument === undefined)
        return null;
    const position = editorDocument.textDocument.offsetAt(params.position);
    const signature = editorDocument.editorService.getSignature(position);
    if (!signature)
        return null;
    return {
        signatures: [
            {
                label: signature.text,
                documentation: { 
                    kind: MarkupKind.Markdown, 
                    value: signature.documentation 
                },
                parameters: signature.parameters.map((p): ParameterInformation => ({
                    label: [
                        p.rangeInSignatureText.position, 
                        p.rangeInSignatureText.position + p.rangeInSignatureText.length
                    ],
                    documentation: { 
                        kind: MarkupKind.Markdown, 
                        value: p.documentation 
                    }
                }))
            }
        ],
        activeSignature: 0,
        activeParameter: signature.activeParameterIndex
    };
});

connection.languages.diagnostics.on(params => {
    const editorDocument = documentURIToEditorDocument.get(params.textDocument.uri);
    if (editorDocument === undefined)
        return { kind: DocumentDiagnosticReportKind.Full, items: [] };
    const diagnostics = editorDocument.editorService.getDiagnostics();
    return { 
        kind: DocumentDiagnosticReportKind.Full, 
        items: diagnostics.map(d => ({
            severity: toLSPDiagnosticsSeverity(d.severity),
            range: toLSPRange(editorDocument.textDocument, d.textRange),
            message: d.message,
            source: "jsonpath"
        }))
    };
});

export function listen() {
    connection.listen();
}

function toLSPRange(document: TextDocument, range: TextRange): Range {
    return {
        start: document.positionAt(range.position),
        end: document.positionAt(range.position + range.length),
    };
}

function toLSPSnippetText(text: string): string {
    let index = 0;
    return text.replace(/\$\{([^}]+)\}/g, (_, name: string) => `\${${++index}:${name}}`);
}

function toLSPDiagnosticsSeverity(severity: DiagnosticsSeverity): DiagnosticSeverity {
    switch (severity) {
        case DiagnosticsSeverity.error: return DiagnosticSeverity.Error;
        case DiagnosticsSeverity.warning: return DiagnosticSeverity.Warning;
    }
}

function toLSPCompletionItemKind(type: CompletionItemType): CompletionItemKind {
    switch (type) {
        case CompletionItemType.name: return CompletionItemKind.Field;
        case CompletionItemType.literal: return CompletionItemKind.Value;
        case CompletionItemType.function: return CompletionItemKind.Function;
        case CompletionItemType.syntax: return CompletionItemKind.Keyword;
    }
}

async function updateDocumentConfiguration(documentURI: string): Promise<void> {
    const editorDocument = documentURIToEditorDocument.get(documentURI);
    if (!editorDocument) return;
    const config = await connection.workspace.getConfiguration({ scopeUri: documentURI, section: "jsonpath" });
    const queryArgument: JSONValue | undefined = config?.queryArgument ?? undefined;
    editorDocument.editorService.updateQueryArgument(queryArgument);
}
