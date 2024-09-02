import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

// Utility function to check if a value is a hex color
const isHexColor = (value: string): boolean => {
    return /^#([0-9A-Fa-f]{3}){1,2}$/.test(value);
};

// Utility function to check if a value is a float with optional unit
const isFloat = (value: string): boolean => {
    return /^\d+(\.\d+)?(px|em|rem)?$/.test(value);
};

interface Mode {
    name: string;
    id: string;
    content: string;
}

const kLOCALKEY = 'figma-variable-input';

export const FigmaVariableGenerator: React.FC = () => {
    const [input, setInput] = useState<Record<string, string>>({});
    const [output, setOutput] = useState<string>('');
    const [autosave, setAutosave] = useState<boolean>(false);
    const [modes, setModes] = useState<Mode[]>([]);
    const [selectedModeId, setSelectedModeId] = useState<string>('');

    useEffect(() => {
        const savedData = localStorage.getItem(kLOCALKEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            setInput(parsedData.input || {});
            setModes(parsedData.modes || []);
            setSelectedModeId(parsedData.selectedModeId || (parsedData.modes?.[0]?.id || ''));
        }
    }, []);

    const saveData = (newInput: Record<string, string>, newModes: Mode[], newSelectedModeId: string) => {
        const dataToSave = {
            input: newInput,
            modes: newModes,
            selectedModeId: newSelectedModeId
        };
        localStorage.setItem(kLOCALKEY, JSON.stringify(dataToSave));
        setAutosave(true);
        setTimeout(() => setAutosave(false), 1000);
    };

    const handleInputChange = (modeId: string, value: string) => {
        const newInput = {
            ...input,
            [modeId]: value
        };
        setInput(newInput);
        saveData(newInput, modes, selectedModeId);
    };

    const generateVariables = () => {
        const variablesMap: Record<string, any> = {};
        const variableIds: string[] = [];

        // First pass: Collect variable data
        modes.forEach((mode) => {
            const lines = input[mode.id]?.split('\n').map(line => line.trim()).filter(line => line);
            if (lines) {
                lines.forEach((line, index) => {
                    const [name, value] = line.split(':').map(part => part.trim());
                    if (!value) return;

                    // Determine the type and resolved value
                    let type: string;
                    let resolvedValue: any;

                    if (isHexColor(value)) {
                        type = 'COLOR';
                        const r = parseInt(value.slice(1, 3), 16) / 255;
                        const g = parseInt(value.slice(3, 5), 16) / 255;
                        const b = parseInt(value.slice(5, 7), 16) / 255;
                        resolvedValue = { r, g, b, a: 1 };
                    } else if (isFloat(value)) {
                        type = 'FLOAT';
                        resolvedValue = parseFloat(value);
                    } else {
                        type = 'STRING';
                        resolvedValue = value;
                    }

                    // Create a unique ID for the variable
                    const variableId = `VariableID:${index + 1}`;
                    variablesMap[name] = {
                        id: variableId,
                        name: name,
                        type: type,
                        valuesByMode: modes.reduce((acc, m) => {
                            acc[m.id] = type === 'COLOR'
                                ? { r: resolvedValue.r, g: resolvedValue.g, b: resolvedValue.b, a: resolvedValue.a }
                                : type === 'FLOAT'
                                    ? resolvedValue
                                    : value;
                            return acc;
                        }, {} as Record<string, any>),
                        resolvedValuesByMode: modes.reduce((acc, m) => {
                            acc[m.id] = {
                                resolvedValue: type === 'COLOR'
                                    ? { r: resolvedValue.r, g: resolvedValue.g, b: resolvedValue.b, a: resolvedValue.a }
                                    : resolvedValue,
                                alias: null
                            };
                            return acc;
                        }, {} as Record<string, any>),
                        scopes: ['ALL_SCOPES'],
                        hiddenFromPublishing: false,
                        codeSyntax: {}
                    };
                    variableIds.push(variableId);
                });
            }
        });

        // Second pass: Handle variable references
        const references = new Set<string>();

        modes.forEach((mode) => {
            const lines = input[mode.id]?.split('\n').map(line => line.trim()).filter(line => line);
            if (lines) {
                lines.forEach((line) => {
                    const [name, value] = line.split(':').map(part => part.trim());
                    references.add(name)
                    if (variablesMap[name]) {
                        if (references.has(value)) {
                            const referencedVariable = value; // Extract the variable name from 'var(--variable-name)'
                            if (variablesMap[name]) {
                                variablesMap[name].valuesByMode[mode.id] = {
                                    type: 'VARIABLE_ALIAS',
                                    id: variablesMap[name].id
                                };
                                variablesMap[name].resolvedValuesByMode[mode.id] = {
                                    resolvedValue: variablesMap[value].resolvedValuesByMode[mode.id].resolvedValue,
                                    alias: variablesMap[referencedVariable].id,
                                    aliasName: variablesMap[referencedVariable].name
                                };
                            }
                        }
                    }
                });
            }
        });

        const result = {
            id: "VariableCollectionId:28:3",
            name: "New Primitives",
            modes: modes.reduce((acc, mode) => {
                acc[mode.id] = mode.name;
                return acc;
            }, {} as { [key: string]: string }),
            variableIds: variableIds,
            variables: Object.values(variablesMap)
        };

        setOutput(JSON.stringify(result, null, 2));
    };


    const handleAddVariant = () => {
        const variantName = prompt('Enter name for the new variant:');
        if (variantName) {
            const newId = `28:${modes.length + 1}`;
            const newModes = [...modes, { name: variantName, id: newId, content: '' }];
            setModes(newModes);
            setInput(prevInput => ({ ...prevInput, [newId]: '' }));
            setSelectedModeId(newId); // Automatically select the new variant
            saveData(input, newModes, newId);
        }
    };

    return (
        <div className="p-6 h-screen flex flex-col gap-4">
            <div className="mb-4">
                <div className="flex gap-2">
                    {modes.map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setSelectedModeId(mode.id)}
                            className={`px-4 py-2 rounded-md ${selectedModeId === mode.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        >
                            {mode.name}
                        </button>
                    ))}
                    <button
                        onClick={handleAddVariant}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
                    >
                        Add Variant
                    </button>
                </div>
            </div>
            <div className="flex flex-1 gap-4">
                <div className="w-1/2 h-full">
                    <Editor
                        height="100%"
                        language="plaintext"
                        value={input[selectedModeId]}
                        onChange={(value) => handleInputChange(selectedModeId, value || "")}
                        options={{
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            wordWrap: 'on',
                        }}
                    />
                </div>
                <div className="flex flex-col justify-center">
                    <button
                        onClick={generateVariables}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                    >
                        Convert
                    </button>
                    {autosave && (
                        <div className="mt-2 text-green-600 animate-pulse">Autosaved!</div>
                    )}
                </div>
                <div className="w-1/2 h-full">
                    <Editor
                        height="100%"
                        language="json"
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
