import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { title } from 'process';

const CUSTOM_MAPPING: {
  [key: string]: {
    [key: string]: string;
  };
} = {
  ".*is-underline": {
    "false": "nounderline",
    "true": "underline",
  },
};

interface Mode {
  name: string;
  id: string;
  content: string;
}

const kLOCALKEY = 'css-variable-input';

interface CSSOutput {
  title: string;
  content: string;
}

const applyCustomMapping = (key: string, value: string, is_reverse: boolean): string => {
  for (const pattern in CUSTOM_MAPPING) {
    const regex = new RegExp(pattern);
    if (regex.test(key)) {
      if (is_reverse) {
        const keyValue = CUSTOM_MAPPING[pattern]
        for (const key in keyValue) {
          console.log("KEY", key, value, keyValue[key])
          if (keyValue[key] === value) {
            return key
          }
        }
        return value
      }
      return CUSTOM_MAPPING[pattern][value] || value;
    }
  }
  return value;
};

const generateCSS = (modes: Mode[], input: Record<string, string>): CSSOutput[] => {
  let cssOutput: CSSOutput[] = [];
  const modeNames = modes.map(m => m.name.toLowerCase().replace(/ /g, "-")); // Ensure consistent mode names

  modes.forEach((mode, modeIndex) => {
    const variableMapForMode: Record<string, string> = {};
    const setNames = new Set<string>();
    const lines = input[mode.id]?.split('\n').map(line => line.trim()).filter(line => line);

    if (lines) {
      lines.forEach(line => {
        const [name, value] = line.split(':').map(part => part.trim());
        if (!value) return;

        const mappedValue = applyCustomMapping(name, value, false);

        if (mode.name.toLowerCase() !== 'default' && variableMapForMode[name]) return;

        variableMapForMode[name] = mappedValue;
      });
    }

    let cssString = `html[data-theme^="${modeNames[modeIndex]}"] {\n`;
    for (const [varName, varValue] of Object.entries(variableMapForMode)) {
      if (setNames.has(varValue)) {
        cssString += `  --${varName}: var(--${varValue});\n`;
      } else {
        cssString += `  --${varName}: ${varValue};\n`;
      }
    }
    cssString += '}';

    cssOutput.push({ title: mode.name, content: cssString });
  });

  return cssOutput;
};

const reverseCSSVariables = (cssContent: string): string => {
  const lines = cssContent.split('\n').filter(line => line.trim() && line.includes('--'));

  const variableMap: Record<string, string> = {};

  lines.forEach(line => {
    const match = line.match(/--([^:]+):\s*([^;]+);/);
    if (match) {
      const [, name, value] = match;
      variableMap[name.trim()] = value.trim();
    }
  });

  const inputLines: string[] = [];
  lines.forEach(line => {
    const match = line.match(/--([^:]+):\s*var\(--([^)]*)\)\s*;/);
    if (match) {
      const [, name, ref] = match;
      const variableName = ref.trim();
      if (variableMap[variableName]) {

        const values = CUSTOM_MAPPING[variableName];

        let reversedValue = applyCustomMapping(name, variableMap[variableName], true);


        if (reversedValue === undefined) reversedValue = variableMap[variableName];
        inputLines.push(`${name.trim()}: ${reversedValue}`);
      }
    } else {
      const match = line.match(/--([^:]+):\s*([^;]+);/);
      if (match) {
        const [, name, value] = match;

        let reversedValue = applyCustomMapping(name, value.trim(), true);

        inputLines.push(`${name.trim()}: ${reversedValue}`);
      }
    }
  });

  return inputLines.join('\n');
};

export const CSSVariableGenerator: React.FC = () => {
  const [input, setInput] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<CSSOutput[]>([]);
  const [autosave, setAutosave] = useState<boolean>(false);
  const [modes, setModes] = useState<Mode[]>([]);
  const [selectedModeId, setSelectedModeId] = useState<string>('');
  const [selectedOutput, setSelectedOutput] = useState<CSSOutput | undefined>(undefined);
  const [outputMode, setOutputMode] = useState<'single' | 'tabs'>('single');

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
    const newInput = { ...input, [modeId]: value };
    setInput(newInput);
    saveData(newInput, modes, selectedModeId);
  };

  const generateCSSVariables = () => {
    const cssOutput = generateCSS(modes, input);
    switch (outputMode) {
      case "single":
        const output = [{ title: "CSS Output", content: cssOutput.map(e => e.content).join("\n\n") }];
        setOutput(output);
        setSelectedOutput(output[0]);
        break;
      case "tabs":
        setOutput(cssOutput);
        if (cssOutput.length > 0) {
          setSelectedOutput(prev => cssOutput.find(e => e.title === prev?.title) || cssOutput[0]);
        }
        break;
    }
  };

  const handleReverseCSS = () => {
    if (selectedOutput) {
      const reversedInput = reverseCSSVariables(selectedOutput.content);
      handleInputChange(selectedModeId, reversedInput);
    }
  };

  const handleAddVariant = () => {
    const variantName = prompt('Enter name for the new variant:');
    if (variantName) {
      const newId = `28:${modes.length + 1}`;
      const newModes = [...modes, { name: variantName, id: newId, content: '' }];
      setModes(newModes);
      setInput(prevInput => ({ ...prevInput, [newId]: '' }));
      setSelectedModeId(newId);
      saveData(input, newModes, newId);
    }
  };

  return (
    <div className="p-6 h-screen flex flex-col gap-4">
      <div className="mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setOutputMode(prev => prev === 'single' ? 'tabs' : 'single')}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition duration-300"
          >
            Toggle Output Mode: {outputMode}
          </button>
        </div>
      </div>
      <div className="flex flex-1 gap-4">
        <div className="w-1/2 h-full flex flex-col space-y-2">
          <div className='flex space-x-2'>
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
            onClick={generateCSSVariables}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
          >
            Generate CSS
          </button>
          <button
            onClick={handleReverseCSS}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
          >
            Reverse CSS
          </button>
          {autosave && (
            <div className="mt-2 text-green-600 animate-pulse">Autosaved!</div>
          )}
        </div>
        <div className="w-1/2 h-full flex flex-col space-y-2">
          <div className='flex space-x-2'>
            {output.map((output) => (
              <button
                key={output.title}
                onClick={() => setSelectedOutput(output)}
                className={`px-4 py-2 rounded-md ${selectedOutput?.title === output.title ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                {output.title}
              </button>
            ))}
          </div>
          <Editor
            height="100%"
            language="css"
            value={selectedOutput?.content || ""}
            onChange={(value) => setSelectedOutput(prev => ({ title: prev?.title || '', content: value || '' }))}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </div>
    </div>
  );
};
