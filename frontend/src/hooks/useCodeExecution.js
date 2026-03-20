import { useState, useEffect } from 'react';
import socket from '../lib/socket';
import api from '../lib/api';

export const useCodeExecution = (sessionId, language, code) => {
  const [executionResult, setExecutionResult] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    socket.on('execution-update', (result) => setExecutionResult(result));
    return () => socket.off('execution-update');
  }, []);

  const runCode = async () => {
    if (!code || isExecuting || !sessionId) return;
    setIsExecuting(true);
    setExecutionResult('⏳ Executing code...');
    socket.emit('code-execution-result', { sessionId, result: '⏳ Executing code...' });

    const platformLangMap = {
      'javascript': { language: 'javascript', version: '18.15.0' },
      'typescript': { language: 'typescript', version: '5.0.3' },
      'python': { language: 'python', version: '3.10.0' },
      'java': { language: 'java', version: '15.0.2' },
      'cpp': { language: 'cpp', version: '10.2.0' },
      'c': { language: 'c', version: '10.2.0' },
      'ruby': { language: 'ruby', version: '3.0.1' },
      'go': { language: 'go', version: '1.16.2' },
      'rust': { language: 'rust', version: '1.68.2' },
      'php': { language: 'php', version: '8.2.3' },
      'swift': { language: 'swift', version: '5.3.3' },
      'kotlin': { language: 'kotlin', version: '1.8.20' },
      'csharp': { language: 'csharp', version: '6.12.0' },
      'bash': { language: 'bash', version: '5.2.0' },
    };

    const target = platformLangMap[language];

    if (!target) {
      const errorMsg = `⚠️ Code execution not supported for "${language}"`;
      setExecutionResult(errorMsg);
      socket.emit('code-execution-result', { sessionId, result: errorMsg });
      setIsExecuting(false);
      return;
    }

    try {
      // Route through our backend proxy to avoid browser CORS/auth issues
      const { data } = await api.post('/execute', {
        language: target.language,
        version: target.version,
        files: [{ content: code }]
      });

      const output = data.run?.output || 'No output detected';
      setExecutionResult(output);
      socket.emit('code-execution-result', { sessionId, result: output });
    } catch (err) {
      console.error('Execution Error:', err);
      const errorMsg = `❌ ${err.response?.data?.message || err.message || 'Execution failed'}`;
      setExecutionResult(errorMsg);
      socket.emit('code-execution-result', { sessionId, result: errorMsg });
    } finally {
      setIsExecuting(false);
    }
  };

  return { executionResult, isExecuting, runCode, setExecutionResult };
};
