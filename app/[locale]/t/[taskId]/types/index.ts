/**
 * 任务数据接口
 */
export interface TaskData {
  share_id: string;
  status: string;
  progress: number;
  model: string;
  task_type: string;
  is_nsfw: boolean;
  parameters?: {
    prompt?: string;
    resolution?: string;
    aspect_ratio?: string;
    [key: string]: any;
  };
  results?: Array<{
    url: string;
    type: string;
  }>;
  created_at: string;
  completed_at?: string;
  error?: any;
}

/**
 * 页面参数接口
 */
export interface PageProps {
  params: Promise<{
    locale: string;
    taskId: string;
  }>;
}
