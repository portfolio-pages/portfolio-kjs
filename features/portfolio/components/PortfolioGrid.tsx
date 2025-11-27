"use client";

import { PortfolioItem } from "../types";

interface PortfolioGridProps {
  items: PortfolioItem[];
  onItemClick?: (item: PortfolioItem) => void;
}

export function PortfolioGrid({ items, onItemClick }: PortfolioGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onItemClick?.(item)}
          className="cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
        >
          {item.thumbnail && (
            <div className="aspect-video bg-gray-200">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            {item.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
            )}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

