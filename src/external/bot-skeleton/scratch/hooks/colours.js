const lightMode = () => {
    const workspace = Blockly;
    workspace.Colours.RootBlock = {
        colour: '#6366f1', // Indigo / Premium Blue-Purple
        colourSecondary: '#4f46e5',
        colourTertiary: '#4338ca',
    };

    workspace.Colours.Base = {
        colour: '#1e293b', // Slate 800
        colourSecondary: '#334155', // Slate 700
        colourTertiary: '#475569', // Slate 600
    };

    workspace.Colours.Special1 = {
        colour: '#0ea5e9', // Cyan 500
        colourSecondary: '#0284c7',
        colourTertiary: '#0369a1',
    };

    workspace.Colours.Special2 = {
        colour: '#10b981', // Emerald 500
        colourSecondary: '#059669',
        colourTertiary: '#047857',
    };

    workspace.Colours.Special3 = {
        colour: '#f43f5e', // Rose 500
        colourSecondary: '#e11d48',
        colourTertiary: '#be123c',
    };

    workspace.Colours.Special4 = {
        colour: '#f59e0b', // Amber 500
        colourSecondary: '#d97706',
        colourTertiary: '#b45309',
    };
};

export const setColors = () => lightMode();
