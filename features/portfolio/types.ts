export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  videoIds: string[];
  thumbnail?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PortfolioFilters {
  category?: string;
  tags?: string[];
  search?: string;
}

