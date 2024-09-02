import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

const LOCAL_STORAGE_KEY_INPUT = 'sort-input';
const LOCAL_STORAGE_KEY_OUTPUT = 'sort-output';

export const SortVariableComponent: React.FC = () => {
    const [input, setInput] = useState<string>('');
    const [output, setOutput] = useState<string>('');
    const [sortingStatus, setSortingStatus] = useState<string | null>(null);
    const [sortingSummary, setSortingSummary] = useState<string | null>(null);

    useEffect(() => {
        // Load input and output from localStorage when component mounts
        const savedInput = localStorage.getItem(LOCAL_STORAGE_KEY_INPUT);
        const savedOutput = localStorage.getItem(LOCAL_STORAGE_KEY_OUTPUT);

        if (savedInput) {
            setInput(savedInput);
        }
        if (savedOutput) {
            setOutput(savedOutput);
        }
    }, []);

    useEffect(() => {
        if (input) {
            localStorage.setItem(LOCAL_STORAGE_KEY_INPUT, input);
        }
        if (output) {
            localStorage.setItem(LOCAL_STORAGE_KEY_OUTPUT, output);
        }
    }, [input, output]);

    const sortLines = (input: string, sortBy: 'key' | 'value'): string => {
        const lines = input.split('\n').filter(line => line.trim());

        const sortedLines = lines.sort((a, b) => {
            const [keyA, valueA] = a.split(':').map(part => part.trim());
            const [keyB, valueB] = b.split(':').map(part => part.trim());

            if (sortBy === 'key') {
                return keyA.localeCompare(keyB);
            } else {
                return valueA.localeCompare(valueB);
            }
        });

        return sortedLines.join('\n');
    };

    const handleSortByKey = () => {
        const sorted = sortLines(input, 'key');
        setOutput(sorted);
        setSortingStatus("Sorted by key!");
        setSortingSummary(`Sorted by key. Total lines: ${input.split('\n').filter(line => line.trim()).length}`);
        setTimeout(() => setSortingStatus(null), 3000); // Clear status after 3 seconds
    };

    const handleSortByValue = () => {
        const sorted = sortLines(input, 'value');
        setOutput(sorted);
        setSortingStatus("Sorted by value!");
        setSortingSummary(`Sorted by value. Total lines: ${input.split('\n').filter(line => line.trim()).length}`);
        setTimeout(() => setSortingStatus(null), 3000); // Clear status after 3 seconds
    };

    return (
        <div className="p-6 h-screen flex flex-col gap-4">
            <div className="mb-4 flex gap-4">
                <button
                    onClick={handleSortByKey}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                >
                    Sort by Key
                </button>
                <button
                    onClick={handleSortByValue}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
                >
                    Sort by Value
                </button>
            </div>
            {sortingStatus && (
                <div className="mb-4 text-green-600">{sortingStatus}</div>
            )}
            {sortingSummary && (
                <div className="mb-4 text-blue-600">{sortingSummary}</div>
            )}
            <div className="flex flex-1 gap-4">
                <div className="w-1/2 h-full flex flex-col">
                    <Editor
                        height="100%"
                        language="plaintext"
                        value={input}
                        onChange={(value) => setInput(value || '')}
                        options={{
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            wordWrap: 'on',
                        }}
                    />
                </div>
                <div className="w-1/2 h-full flex flex-col">
                    <Editor
                        height="100%"
                        language="plaintext"
                        value={output}
                        options={{
                            minimap: { enabled: false },
                            readOnly: true,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
