import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

const LOCAL_STORAGE_KEY_INPUT = 'dedupe-input';
const LOCAL_STORAGE_KEY_OUTPUT = 'dedupe-output';

export const DedupeVariable: React.FC = () => {
    const [input, setInput] = useState<string>('');
    const [output, setOutput] = useState<string>('');
    const [deduplicationStatus, setDeduplicationStatus] = useState<string | null>(null);
    const [deduplicationSummary, setDeduplicationSummary] = useState<string | null>(null);

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

    const dedupeValues = (input: string): string => {
        const lines = input.split('\n').filter(line => line.trim());
        const valueToKeyMap: Record<string, string> = {};
        const resultLines: string[] = [];
        let duplicatesCount = 0;

        lines.forEach(line => {
            const [key, value] = line.split(':').map(part => part.trim());
            if (valueToKeyMap[value]) {
                // Replace duplicate value with the original key
                resultLines.push(`${key}: ${valueToKeyMap[value]}`);
                duplicatesCount++;
            } else {
                valueToKeyMap[value] = key;
                resultLines.push(`${key}: ${value}`);
            }
        });

        setDeduplicationSummary(`Deduplicated ${duplicatesCount} variables.`);
        return resultLines.join('\n');
    };

    const reverseDedupeValues = (input: string): string => {
        const lines = input.split('\n').filter(line => line.trim());
        const keyToValueMap: Record<string, string> = {};
        const resultLines: string[] = [];
        let replacementsCount = 0;

        lines.forEach(line => {
            const [key, value] = line.split(':').map(part => part.trim());
            if (keyToValueMap[value]) {
                // Replace duplicate key with the original value
                resultLines.push(`${keyToValueMap[value]}: ${key}`);
                replacementsCount++;
            } else {
                keyToValueMap[key] = value;
                resultLines.push(`${key}: ${value}`);
            }
        });

        setDeduplicationSummary(`Reversed deduplicated ${replacementsCount} variables.`);
        return resultLines.join('\n');
    };

    const handleDeduplicate = () => {
        const deduplicated = dedupeValues(input);
        setOutput(deduplicated);
        setDeduplicationStatus("Deduplication complete!");
        setTimeout(() => setDeduplicationStatus(null), 3000); // Clear status after 3 seconds
    };

    const handleReverseDeduplicate = () => {
        const reversedDeduplicated = reverseDedupeValues(input);
        setOutput(reversedDeduplicated);
        setDeduplicationStatus("Reverse deduplication complete!");
        setTimeout(() => setDeduplicationStatus(null), 3000); // Clear status after 3 seconds
    };

    return (
        <div className="p-6 h-screen flex flex-col gap-4">
            <div className="mb-4 flex gap-4">
                <button
                    onClick={handleDeduplicate}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                >
                    Deduplicate
                </button>
                <button
                    onClick={handleReverseDeduplicate}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
                >
                    Reverse Deduplicate
                </button>
            </div>
            {deduplicationStatus && (
                <div className="mb-4 text-green-600">{deduplicationStatus}</div>
            )}
            {deduplicationSummary && (
                <div className="mb-4 text-blue-600">{deduplicationSummary}</div>
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
