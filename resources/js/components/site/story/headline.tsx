/**
 * A headline split into words. Each word morphs on its own, so a headline can
 * change size and line breaks without being stretched.
 */
export function Headline({ text }: { text: string }) {
    return text.split(/\s+/).map((word, index) => (
        <span key={index}>
            {index > 0 && ' '}
            <span
                className="story-word"
                style={{ '--vt': `w${index}` } as React.CSSProperties}
            >
                {word}
            </span>
        </span>
    ));
}
