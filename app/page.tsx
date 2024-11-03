"use client";

import { useState, useEffect } from "react";
import { ThumbsDown, Hand, ThumbsUp, LucideIcon } from "lucide-react";

interface VotingButtonProps {
    icon: LucideIcon;
    count: number;
    isSelected: boolean;
    onClick: () => void;
    label: string;
}

interface WebSocketMessage {
    action: "select" | "deselect";
    button: number;
}

const VotingButton = ({
    icon: Icon,
    count,
    isSelected,
    onClick,
    label,
}: VotingButtonProps) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${
            isSelected
                ? "bg-blue-500 text-white shadow-lg scale-105"
                : "bg-white hover:bg-gray-50 text-gray-700 shadow"
        }`}
    >
        <Icon size={24} className="mb-2" />
        <span className="text-sm font-medium">{count}</span>
        <span className="sr-only">{label}</span>
    </button>
);

const buttons: Array<{ icon: LucideIcon; label: string }> = [
    { icon: ThumbsDown, label: "Thumbs down" },
    { icon: Hand, label: "Hand" },
    { icon: ThumbsUp, label: "Thumbs up" },
];

export default function VotingPage() {
    const [mounted, setMounted] = useState<boolean>(false);
    const [selectedButton, setSelectedButton] = useState<number | null>(null);
    const [counts, setCounts] = useState<[number, number, number]>([0, 0, 0]);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        setMounted(true);

        const ws = new WebSocket("ws://localhost:3001");

        ws.onopen = () => {
            console.log("WebSocket connection established");
        };

        ws.onmessage = (event: MessageEvent) => {
            const newCounts = JSON.parse(event.data) as [
                number,
                number,
                number,
            ];
            setCounts(newCounts);
        };

        ws.onerror = (error: Event) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };

        setSocket(ws);

        return () => {
            ws.close();
        };
    }, []);

    const handleButtonClick = (buttonIndex: number) => {
        const message: WebSocketMessage =
            selectedButton === buttonIndex
                ? { action: "deselect", button: buttonIndex }
                : { action: "select", button: buttonIndex };

        if (selectedButton !== null && selectedButton !== buttonIndex) {
            socket?.send(
                JSON.stringify({
                    action: "deselect",
                    button: selectedButton,
                } as WebSocketMessage)
            );
        }

        socket?.send(JSON.stringify(message));
        setSelectedButton(selectedButton === buttonIndex ? null : buttonIndex);
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center gap-4">
            {buttons.map((button, index) => (
                <VotingButton
                    key={index}
                    icon={button.icon}
                    count={counts[index]}
                    isSelected={selectedButton === index}
                    onClick={() => handleButtonClick(index)}
                    label={button.label}
                />
            ))}
        </div>
    );
}
