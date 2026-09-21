import { useId, useRef, useState } from "react";

import { Minus, Plus } from "lucide-react";

const formatStep = (index) => String(index + 1).padStart(2, "0");

const Accordion = ({
    items = [],
    allowMultiple = false,
    numbered = true,
    className = "",
}) => {
    const baseId = useId();
    const [openIds, setOpenIds] = useState([]);
    const buttonRefs = useRef([]);

    const visibleItems = items.filter(
        (item) => item?.question?.trim() && item?.answer?.trim()
    );

    if (visibleItems.length === 0) return null;

    const toggle = (id) => {
        setOpenIds((current) => {
            const isOpen = current.includes(id);

            if (allowMultiple) {
                return isOpen
                    ? current.filter((item) => item !== id)
                    : [...current, id];
            }

            return isOpen ? [] : [id];
        });
    };

    const focusButton = (index) => {
        const next = buttonRefs.current[index];
        if (next) next.focus();
    };

    const handleKeyDown = (event, index) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            focusButton((index + 1) % visibleItems.length);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            focusButton(
                (index - 1 + visibleItems.length) % visibleItems.length
            );
        } else if (event.key === "Home") {
            event.preventDefault();
            focusButton(0);
        } else if (event.key === "End") {
            event.preventDefault();
            focusButton(visibleItems.length - 1);
        }
    };

    return (
        <div className={["public-accordion", className].join(" ")}>
            {visibleItems.map((item, index) => {
                const id = item.id ?? `${baseId}-${index}`;
                const isOpen = openIds.includes(id);
                const panelId = `${id}-panel`;
                const headerId = `${id}-header`;
                const Icon = isOpen ? Minus : Plus;

                return (
                    <div
                        key={id}
                        className={[
                            "public-accordion-item",
                            isOpen ? "is-open" : "",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                    >
                        <h3 className="public-accordion-heading">
                            <button
                                ref={(node) => {
                                    buttonRefs.current[index] = node;
                                }}
                                id={headerId}
                                type="button"
                                className="public-accordion-trigger"
                                aria-expanded={isOpen}
                                aria-controls={panelId}
                                onClick={() => toggle(id)}
                                onKeyDown={(event) =>
                                    handleKeyDown(event, index)
                                }
                            >
                                {numbered ? (
                                    <span
                                        className="public-accordion-number"
                                        aria-hidden="true"
                                    >
                                        {formatStep(index)}
                                    </span>
                                ) : null}
                                <span className="public-accordion-question">
                                    {item.question}
                                </span>
                                <Icon
                                    size={18}
                                    strokeWidth={2}
                                    className="public-accordion-icon"
                                    aria-hidden="true"
                                />
                            </button>
                        </h3>
                        <div
                            id={panelId}
                            role="region"
                            aria-labelledby={headerId}
                            hidden={!isOpen}
                            className="public-accordion-panel"
                        >
                            <p className="public-accordion-answer">
                                {item.answer}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Accordion;
