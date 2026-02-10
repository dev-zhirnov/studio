import { parentPort, workerData } from 'worker_threads';
import fetch from 'node-fetch';

interface WorkerData {
  url: string;
  type: 'posts' | 'pages' | 'categories';
}

interface WpPost {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  link: string;
  _embedded: any;
  acf: any;
}

interface WpCategory {
  id: number;
  name: string;
  count: number;
  slug: string;
}

const fetchWpData = async (url: string, type: string): Promise<WpPost[] | WpCategory[]> => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (type === 'posts' || type === 'pages') {
      return data as WpPost[];
    } else if (type === 'categories') {
      return data as WpCategory[];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching WP data:', error);
    return [];
  }
};

if (parentPort) {
  parentPort.on('message', async (data: WorkerData) => {
    try {
      const result = await fetchWpData(data.url, data.type);
      parentPort?.postMessage({ success: true, data: result });
    } catch (error) {
      parentPort?.postMessage({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
}

export { fetchWpData };