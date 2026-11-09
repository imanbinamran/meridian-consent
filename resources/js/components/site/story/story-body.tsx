import type { StoryBlock, StorySection } from './types';

function EndMark() {
    return (
        <span className="story-endmark" id="story-end" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
                <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="3"
                />
                <ellipse
                    cx="16"
                    cy="16"
                    rx="6"
                    ry="14"
                    stroke="currentColor"
                    strokeWidth="2"
                />
                <path
                    d="M16 2v28M3 16h26"
                    stroke="currentColor"
                    strokeWidth="2"
                />
            </svg>
        </span>
    );
}

function Block({
    block,
    lede,
    last,
}: {
    block: StoryBlock;
    lede: boolean;
    last: boolean;
}) {
    switch (block.type) {
        case 'p':
            return (
                <p className={lede ? 'story-lede' : undefined}>
                    {block.text}
                    {last && <EndMark />}
                </p>
            );
        case 'pullquote':
            // Repeats a line from the story, so screen readers skip it.
            return (
                <blockquote className="story-pullquote" aria-hidden="true">
                    {block.text}
                </blockquote>
            );
        case 'guide':
            return (
                <figure className="story-guide">
                    <figcaption>{block.title}</figcaption>
                    <dl>
                        {block.rows.map((row) => (
                            <div key={row.term}>
                                <dt>{row.term}</dt>
                                <dd>{row.meaning}</dd>
                            </div>
                        ))}
                    </dl>
                </figure>
            );
    }
}

export function StoryBody({ sections }: { sections: StorySection[] }) {
    const lastSection = sections.length - 1;
    const lastParagraph = sections[lastSection].blocks
        .map((block) => block.type)
        .lastIndexOf('p');
    const firstParagraph = sections[0].blocks
        .map((block) => block.type)
        .indexOf('p');

    return (
        <div className="story-body font-display">
            {sections.map((section, sectionIndex) => (
                <section
                    key={section.id}
                    id={section.id}
                    data-section={section.name}
                    aria-label={sectionIndex === 0 ? section.name : undefined}
                    className="story-section"
                >
                    {sectionIndex > 0 && (
                        <>
                            <span className="story-rule" aria-hidden="true" />
                            <h2>{section.name}</h2>
                        </>
                    )}
                    {section.blocks.map((block, blockIndex) => (
                        <Block
                            key={blockIndex}
                            block={block}
                            lede={
                                sectionIndex === 0 &&
                                blockIndex === firstParagraph
                            }
                            last={
                                sectionIndex === lastSection &&
                                blockIndex === lastParagraph
                            }
                        />
                    ))}
                </section>
            ))}
        </div>
    );
}
