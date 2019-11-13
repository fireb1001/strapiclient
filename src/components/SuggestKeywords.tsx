import React from "react";

interface SuggestKeywordsProps {
  kwContext: string;
  suggestions: string[];
  handleSelect: (kw: string) => void;
}

export default function SuggestKeywords({
  handleSelect,
  suggestions,
  kwContext
}: SuggestKeywordsProps) {
  return (
    <div>
      {suggestions &&
        suggestions.map((kw, index) => (
          <span
            key={index}
            onClick={() => {
              handleSelect(kw);
            }}
          >
            {kw}
          </span>
        ))}
    </div>
  );
}
