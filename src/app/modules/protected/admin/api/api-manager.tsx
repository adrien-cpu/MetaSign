import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Play,
  Pause,
  Plus,
  Settings,
  AlertTriangle,
  Check,
  RefreshCw
} from 'lucide-react';

// Define a type for the API status
type APIStatus = 'active' | 'configuring' | 'warning' | 'error';

// Define a type for the API object
interface API {
  id: string;
  name: string;
  status: APIStatus;
  endpoints: number;
  latency: string;
  usage: string;
  models: string[];
}

const APIManager = () => {
  const [apis, setApis] = useState<API[]>([
    {
      id: 'huggingface',
      name: 'Hugging Face',
      status: 'active',
      endpoints: 12,
      latency: '45ms',
      usage: '78%',
      models: [
        'sign-language-translator',
        'gesture-recognition',
        'emotion-detection'
      ]
    },
    {
      id: 'openai',
      name: 'OpenAI',
      status: 'configuring',
      endpoints: 5,
      latency: '-',
      usage: '0%',
      models: []
    },
    {
      id: 'tensorflow',
      name: 'TensorFlow Hub',
      status: 'warning',
      endpoints: 8,
      latency: '120ms',
      usage: '92%',
      models: ['pose-detection', 'hand-tracking']
    }
  ]);

  const toggleApiStatus = (apiId: string) => {
    setApis(currentApis =>
      currentApis.map(api => {
        if (api.id === apiId) {
          return {
            ...api,
            status: api.status === 'active' ? 'configuring' : 'active'
          };
        }
        return api;
      })
    );
  };

  const getStatusIcon = (status: APIStatus) => {
    const statusIcons: Record<APIStatus, React.ReactElement> = {
      active: <Check className="h-4 w-4 text-green-500" />,
      warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
      error: <AlertTriangle className="h-4 w-4 text-red-500" />,
      configuring: <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
    };
    return statusIcons[status];
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">API Management</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Connect New API
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apis.map(api => (
          <Card key={api.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {api.name}
              </CardTitle>
              {getStatusIcon(api.status)}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['endpoints', 'latency', 'usage'].map((metric, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm capitalize">{metric}:</span>
                    <span className="font-medium">{api[metric as keyof API]}</span>
                  </div>
                ))}

                {api.models.length > 0 && (
                  <div className="mt-4">
                    <span className="text-sm font-medium">Active Models:</span>
                    <div className="mt-2 space-y-1">
                      {api.models.map(model => (
                        <div key={model} className="text-sm bg-gray-50 p-2 rounded-md">
                          {model}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => toggleApiStatus(api.id)}
                  >
                    {api.status === 'active' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    {api.status === 'active' ? 'Pause' : 'Start'}
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Settings className="h-3 w-3" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <Alert variant="warning">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription message="TensorFlow Hub API is approaching usage limit (92%)" />
          </div>
        </Alert>
      </div>
    </div>
  );
};

export default APIManager;