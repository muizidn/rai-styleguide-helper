import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sidebar } from './Sidebar';
import { FigmaVariableGenerator } from './FigmaVariableGenerator';
import { DiffViewer } from './DiffViewer';
import { CSSVariableGenerator } from './CSSVariableGenerator';
import { DedupeVariable } from './DedupeVariable';
import { VariableGrouper } from './VariableGrouper';
import { SortVariableComponent } from './SortVariable';

interface Tab {
    id: string;
    label: string;
    component: JSX.Element;
    description: string;
}

export const Layout: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('figma');
    const [isDescriptionVisible, setDescriptionVisible] = useState<boolean>(true);

    useEffect(() => {
        const savedVisibility = localStorage.getItem('descriptionVisibility');
        if (savedVisibility) {
            setDescriptionVisible(JSON.parse(savedVisibility));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('descriptionVisibility', JSON.stringify(isDescriptionVisible));
    }, [isDescriptionVisible]);

    const tabs: Tab[] = [
        {
            id: 'figma',
            label: 'Figma',
            component: <FigmaVariableGenerator />,
            description: `
**Figma Variable Generator**

Generate Figma design tokens in variable format.

**Input:**
- A list of design tokens formatted as key-value pairs.
- Example:
\`\`\`
  color-primary: #4a90e2
  color-secondary: #50e3c2
\`\`\`
**Output:**
- A structured variable file suitable for use in CSS or other styling frameworks.
`
        },
        {
            id: 'diff',
            label: 'Diff',
            component: <DiffViewer />,
            description: `
**Diff Viewer**

Compare two versions of a variable file to see differences.

**Input:**
- Two variable files with key-value pairs.
- Example:
\`\`\`
  color-primary: #4a90e2
  color-secondary: #50e3c2
\`\`\`

**Output:**
- Highlights the differences between the two files, showing what has changed.
`
        },
        {
            id: 'css',
            label: 'CSS',
            component: <CSSVariableGenerator />,
            description: `
**CSS Variable Generator**

Convert CSS styles into variable format.

**Input:**
- CSS styles in text format.
- Example:
  \`color: #4a90e2;\`
  \`background-color: #50e3c2;\`

**Output:**
- A set of variables representing those styles, which can be used in your CSS or preprocessor files.
`
        },
        {
            id: 'dedupe',
            label: 'DedupeVariable',
            component: <DedupeVariable />,
            description: `
**Dedupe Variable**

Remove duplicate key-value pairs from your variables.

**Input:**
- A list of key-value pairs where some values may be duplicated.
- Example:
\`\`\`
  color-primary: #4a90e2
  color-secondary: #50e3c2
\`\`\`

**Output:**
- A deduplicated list where each value is unique, replacing duplicates with the original key.
`
        },
        {
            id: 'variablebeautifier',
            label: 'VariableGrouper',
            component: <VariableGrouper />,
            description: `
**Variable Grouper**

Group related variables together.

**Input:**
- A list of key-value pairs.
- Example:
\`\`\`
  color-primary: #4a90e2
  color-secondary: #50e3c2
\`\`\`

**Output:**
- A grouped and organized list where variables are categorized based on names or types, making them easier to manage.
`
        },
        {
            id: 'sortvariable',
            label: 'SortVariable',
            component: <SortVariableComponent />,
            description: `
**Sort Variable**

Sort key-value pairs either by key or value.

**Input:**
- A list of key-value pairs.
- Example:
\`\`\`
  color-primary: #4a90e2
  color-secondary: #50e3c2
\`\`\`

**Output:**
- The list sorted according to either the keys or the values, based on user choice.
`
        },
        {
            id: 'files',
            label: 'Files',
            component: <div>Files View</div>,
            description: `
**Files View**

View and manage files within the application.
`
        },
    ];

    const activeTabContent = tabs.find(tab => tab.id === activeTab);
    const activeTabDescription = activeTabContent?.description || '';

    const toggleDescriptionVisibility = () => {
        setDescriptionVisible(!isDescriptionVisible);
    };

    return (
        <div className="flex h-screen">
            <Sidebar
                tabs={tabs.map(tab => ({ id: tab.id, label: tab.label }))}
                onTabChange={setActiveTab}
            />
            <div className="flex-1 p-6 bg-gray-100">
                <div className="mb-4 text-lg font-bold">{activeTabContent?.label}</div>
                <button
                    onClick={toggleDescriptionVisibility}
                    className="mb-4 px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition duration-300"
                >
                    {isDescriptionVisible ? 'Hide Description' : 'Show Description'}
                </button>
                {isDescriptionVisible && (
                    <div className="prose">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {activeTabDescription}
                        </ReactMarkdown>
                    </div>
                )}
                {activeTabContent?.component}
            </div>
        </div>
    );
};
