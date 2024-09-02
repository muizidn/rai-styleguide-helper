import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { DiffEditor } from '@monaco-editor/react';

const LOCAL_STORAGE_KEY_ORIGINAL = 'diff-viewer-original';
const LOCAL_STORAGE_KEY_MODIFIED = 'diff-viewer-modified';

export const DiffViewer: React.FC = () => {
    const [original, setOriginal] = useState<string>('');
    const [modified, setModified] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false); // Toggle between diff and edit mode
    const [editorMode, setEditorMode] = useState<'diff' | 'standard'>('diff'); // Toggle between diff and standard modes
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    const originalEditorRef = useRef<any>(null); // Reference for the original editor
    const modifiedEditorRef = useRef<any>(null); // Reference for the modified editor

    useEffect(() => {
        // Load input and output from localStorage when component mounts
        const savedOriginal = localStorage.getItem(LOCAL_STORAGE_KEY_ORIGINAL);
        const savedModified = localStorage.getItem(LOCAL_STORAGE_KEY_MODIFIED);

        if (savedOriginal) {
            setOriginal(savedOriginal);
        }
        if (savedModified) {
            setModified(savedModified);
        }
    }, []);

    useEffect(() => {
        if (original) {
            localStorage.setItem(LOCAL_STORAGE_KEY_ORIGINAL, original);
        }
        if (modified) {
            localStorage.setItem(LOCAL_STORAGE_KEY_MODIFIED, modified);
        }
        // Indicate that content was saved
        setSaveStatus("Content saved to localStorage.");
        setTimeout(() => setSaveStatus(null), 3000); // Clear status after 3 seconds
    }, [original, modified]);

    const handleOriginalChange = (value: string | undefined) => {
        if (value !== undefined) {
            setOriginal(value);
        }
    };

    const handleModifiedChange = (value: string | undefined) => {
        if (value !== undefined) {
            setModified(value);
        }
    };

    return (
        <div className="flex flex-col h-full p-4 gap-4">
            {/* Toggleable view between diff and standard */}
            <div className="flex mb-4">
                <button
                    onClick={() => setEditorMode(editorMode === 'diff' ? 'standard' : 'diff')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                >
                    {editorMode === 'diff' ? 'Switch to Standard View' : 'Switch to Diff View'}
                </button>
                {editorMode === 'diff' && (
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-4 py-2 ml-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
                    >
                        {isEditing ? 'View Diff' : 'Edit Original'}
                    </button>
                )}
            </div>

            {saveStatus && (
                <div className="mb-4 text-blue-600">{saveStatus}</div>
            )}

            {/* Display DiffEditor if in diff mode */}
            {editorMode === 'diff' && !isEditing && (
                <DiffEditor
                    height="90vh"
                    language="plaintext"
                    original={original}
                    modified={modified}
                    options={{
                        readOnly: false,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                    }}
                />
            )}

            {/* Display individual editors if in standard mode or if editing */}
            {editorMode === 'standard' && (
                <div className="flex gap-4">
                    <div className="flex-1">
                        <Editor
                            height="90vh"
                            language="plaintext"
                            value={original}
                            onChange={handleOriginalChange}
                            options={{
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                            theme="vs-light"
                            onMount={(editor) => {
                                originalEditorRef.current = editor;
                            }}
                        />
                    </div>
                    <div className="flex-1">
                        <Editor
                            height="90vh"
                            language="plaintext"
                            value={modified}
                            onChange={handleModifiedChange}
                            options={{
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                            theme="vs-light"
                            onMount={(editor) => {
                                modifiedEditorRef.current = editor;
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Editable mode for original content */}
            {editorMode === 'diff' && isEditing && (
                <div className="flex flex-col gap-4">
                    <div className="flex-1">
                        <Editor
                            height="90vh"
                            language="plaintext"
                            value={original}
                            onChange={handleOriginalChange}
                            options={{
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                            theme="vs-light"
                            onMount={(editor) => {
                                originalEditorRef.current = editor;
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
