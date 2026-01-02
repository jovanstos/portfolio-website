import "../styles/About.css";
import { useMemo, useState } from "react";

export type TimelineItem = {
    id: string;
    date: string;
    title: string;
    description: string;
};

type TimelineProps = {
    items: TimelineItem[];
};

export default function Timeline({ items }: TimelineProps) {
    const [openId, setOpenId] = useState<string | null>(null);

    const enhancedItems = useMemo(() => {
        return items.map((item) => ({
            ...item,
            displayDate: item.date,
            color: "#0e0f1a",
        }));
    }, [items]);

    return (
        <section className="vTimeline" aria-label="Timeline">
            {enhancedItems.map((item) => {
                const isOpen = openId === item.id;

                return (
                    <div key={item.id} className="vTimelineRow">
                        <div className="vTimelineLeft">
                            <h4 className="vTimelineDate">{item.displayDate}</h4>
                        </div>
                        <div className="vTimelineCenter">
                            <button
                                type="button"
                                className={`vTimelineDot ${isOpen ? "active" : ""}`}
                                style={{ backgroundColor: item.color }}
                                onClick={() => setOpenId(isOpen ? null : item.id)}
                                aria-expanded={isOpen}
                                aria-controls={`timeline-card-${item.id}`}
                                title={isOpen ? "Collapse" : "Expand"}
                            />
                        </div>
                        <div className="vTimelineRight">
                            <div
                                id={`timeline-card-${item.id}`}
                                className={`vTimelineCard ${isOpen ? "open" : ""}`}
                            >
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </section>
    );
}
