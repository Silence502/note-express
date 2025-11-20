export const contrastColor = (background: string) => {
    if (!background)
        return 'var(--p-primary-900)'

    if (background.startsWith('#'))
        background = background.slice(1)

    const rgb = background.match(/.{1,2}/g);

    if (!rgb)
        return 'var(--p-primary-900)'

    const brightness = Math.round(((parseInt(rgb[0], 16) * 299) +
        (parseInt(rgb[1]??'', 16) * 587) +
        (parseInt(rgb[2]??'', 16) * 114)) / 1000);

    return (brightness > 125) ? 'var(--p-primary-900)' : 'var(--p-primary-50)';
}