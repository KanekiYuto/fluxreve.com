/**
 * 创意社区相关的类型定义
 */

export interface ExploreTask {
  taskId: string;
  shareId: string;
  model: string;
  taskType: string;
  parameters: {
    prompt: string;
    aspect_ratio?: string;
    resolution?: string;
    seed?: string;
  };
  results: Array<{
    url: string;
    type: string;
  }>;
  completedAt: string;
  isNsfw: boolean;
  viewCount: number;
}

export interface ExplorePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ExploreResponse {
  success: boolean;
  data?: ExploreTask[];
  pagination?: ExplorePagination;
  error?: string;
}
