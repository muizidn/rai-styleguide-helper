// utils/group-variables.ts

const findLongestCommonPrefix = (str1: string, str2: string): string => {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
        i++;
    }
    return str1.slice(0, i);
};

export const groupVariables = (input: string): string => {
    // Split the input into lines and filter out any empty lines
    const lines = input.split('\n').map(line => line.trim()).filter(line => line);

    // Extract variable names and values, preserving order
    const variables: [string, string][] = lines.map(line => {
        const [name, value] = line.split(':').map(part => part.trim());
        return [name, value];
    });

    if (variables.length === 0) return '';

    const groups: Record<string, string[]> = {};
    const addedPrefixes = new Set<string>();

    const addToGroups = (name: string, value: string) => {
        let prefixAdded = false;
        
        for (const [prefix, group] of Object.entries(groups)) {
            if (name.startsWith(prefix)) {
                group.push(`${name}: ${value}`);
                prefixAdded = true;
                break;
            }
        }

        if (!prefixAdded) {
            // Find the longest common prefix for the new prefix
            let newPrefix = '';
            for (const [otherName] of variables) {
                if (otherName !== name) {
                    const prefix = findLongestCommonPrefix(name, otherName);
                    if (prefix.length > newPrefix.length) {
                        newPrefix = prefix;
                    }
                }
            }
            
            if (newPrefix && !addedPrefixes.has(newPrefix)) {
                groups[newPrefix] = [`${name}: ${value}`];
                addedPrefixes.add(newPrefix);
            }
        }
    };

    // Process each variable and group them
    variables.forEach(([name, value]) => addToGroups(name, value));

    // Format the output string by joining each group with newlines and adding a blank line between groups
    const result = Object.values(groups).map(group => group.join('\n')).join('\n\n');

    return result;
};
