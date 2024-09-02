// VariableGrouper.tsx

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { groupVariables } from '../utils/group_variable';

export const VariableGrouper: React.FC = () => {
    const [input, setInput] = useState<string>('');
    const [output, setOutput] = useState<string>('');

    const handleGroup = () => {
        const beautified = groupVariables(input);
        setOutput(beautified);
    };

    return (
        <div className="p-6 h-screen flex flex-col gap-4">
            <div className="mt-4">
                <button
                    onClick={handleGroup}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                >
                    Group Variables
                </button>
            </div>
            <div className="flex flex-1 gap-4">
                {/* Input Editor */}
                <div className="w-1/2 h-full flex flex-col space-y-2">
                    <h2 className="text-xl font-semibold mb-2">Input</h2>
                    <Editor
                        height="50vh"
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

                {/* Output Editor */}
                <div className="w-1/2 h-full flex flex-col space-y-2">
                    <h2 className="text-xl font-semibold mb-2">Output</h2>
                    <Editor
                        height="50vh"
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