'use client';
import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { MdPieChart, MdBarChart, MdShowChart } from 'react-icons/md';
import { motion } from "framer-motion";
import { Rnd } from "react-rnd";
import DashboardHeader from '../components/DashboardHeader';
import ThinkingAnimation from '../components/ThinkingAnimation';
import { GiRadarSweep } from "react-icons/gi";

const datasets = {
  Drivers: {
    pie: [
      { name: 'Petrol', value: 12 },
      { name: 'Diesel', value: 19 },
      { name: 'LPG', value: 7 },
    ],
    bar: [
      { name: 'Jan', shipments: 30 },
      { name: 'Feb', shipments: 45 },
      { name: 'Mar', shipments: 20 },
      { name: 'Apr', shipments: 50 },
    ],
  },
  Shipments: {
    pie: [
      { name: 'Petrol', value: 5 },
      { name: 'Diesel', value: 15 },
      { name: 'LPG', value: 8 },
    ],
    bar: [
      { name: 'Jan', shipments: 15 },
      { name: 'Feb', shipments: 30 },
      { name: 'Mar', shipments: 50 },
      { name: 'Apr', shipments: 25 },
    ],
  },
  Locations: {
    pie: [
      { name: 'Petrol', value: 7 },
      { name: 'Diesel', value: 10 },
      { name: 'LPG', value: 5 },
    ],
    bar: [
      { name: 'Jan', shipments: 40 },
      { name: 'Feb', shipments: 20 },
      { name: 'Mar', shipments: 35 },
      { name: 'Apr', shipments: 45 },
    ],
  },
  Vehicles: {
    pie: [
      { name: 'Truck', value: 10 },
      { name: 'Tanker', value: 20 },
      { name: 'Van', value: 12 },
    ],
    bar: [
      { name: 'Jan', shipments: 25 },
      { name: 'Feb', shipments: 35 },
      { name: 'Mar', shipments: 40 },
      { name: 'Apr', shipments: 55 },
    ],
  },
  Products: {
    pie: [
      { name: 'Petrol', value: 22 },
      { name: 'Diesel', value: 29 },
      { name: 'LPG', value: 15 },
    ],
    bar: [
      { name: 'Jan', shipments: 20 },
      { name: 'Feb', shipments: 28 },
      { name: 'Mar', shipments: 42 },
      { name: 'Apr', shipments: 38 },
    ],
  },
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const [pieSize, setPieSize] = useState({ width: 500, height: 350 });
  const [barSize, setBarSize] = useState({ width: 500, height: 350 });
  const [stackSize, setStackSize] = useState({ width: 500, height: 350 });
  const [piePos, setPiePos] = useState({ x: 0, y: 100 });
  const [barPos, setBarPos] = useState({ x: 520, y: 100 });
  const [stackPos, setStackPos] = useState({ x: 0, y: 180 });
  const [lineSize, setLineSize] = useState({ width: 500, height: 350 });
  const [linePos, setLinePos] = useState({ x: 0, y: 100 });
  const [radarSize, setRadarSize] = useState({ width: 500, height: 350 });
  const [radarPos, setRadarPos] = useState({ x: 0, y: 100 });



  const [visible, setVisible] = useState({
    pie: false,
    bar: false,
    stack: false,
    line: false,
    radar: false
  });

  const [xTable, setXTable] = useState(null);
  const [yTable, setYTable] = useState(null);

  const handleDragStart = (e, table) => {
    e.dataTransfer.setData("table", table);
  };

  // combine data
  let combinedPie = [];
  let combinedBarLine = [];
  if (xTable && yTable) {
    const xPie = datasets[xTable].pie;
    const yPie = datasets[yTable].pie;
    combinedPie = xPie.map((x) => {
      const y = yPie.find((yy) => yy.name === x.name);
      return { name: x.name, xValue: x.value, yValue: y ? y.value : 0 };
    });

    const xBar = datasets[xTable].bar;
    const yBar = datasets[yTable].bar;
    combinedBarLine = xBar.map((x) => {
      const y = yBar.find((yy) => yy.name === x.name);
      return { name: x.name, xShipments: x.shipments, yShipments: y ? y.shipments : 0 };
    });
  }

  // chat state
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [modVis, setModVis] = useState(false);
  
  // Upload modal states
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // File upload handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    setUploadError('');
    setUploadSuccess(false);
    
    // File validation
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['.csv', '.json', '.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (file.size > maxSize) {
      setUploadError('File size exceeds 50MB limit');
      return;
    }
    
    if (!allowedTypes.includes(fileExtension)) {
      setUploadError('Please select a CSV, JSON, or Excel file');
      return;
    }
    
    setSelectedFile(file);
    simulateUpload(file);
  };

  const simulateUpload = (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadSuccess(true);
          setTimeout(() => {
            setModVis("done");
          }, 1000);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
  };

  const handleSend = async () => {
    if (!query.trim() || loading) return;

    const userMessage = { role: 'user', content: query };
    setMessages((m) => [...m, userMessage]);
    setQuery('');
    setLoading(true);
    setIsStreaming(true);

    // Add thinking message that will be replaced with streaming content
    const assistantMessageIndex = messages.length + 1;
    setMessages((m) => [...m, { role: 'assistant', content: '', streaming: true, thinking: true }]);

    try {
      // Get current context for RAG
      const activeDatasets = [xTable, yTable].filter(Boolean);
      const visibleCharts = Object.entries(visible)
        .filter(([_, isVisible]) => isVisible)
        .map(([chartType]) => chartType);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [userMessage], // Send only the current user message
          activeDatasets,
          visibleCharts,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              setIsStreaming(false);
              setMessages((m) => {
                const newMessages = [...m];
                if (newMessages[assistantMessageIndex]) {
                  newMessages[assistantMessageIndex] = {
                    ...newMessages[assistantMessageIndex],
                    streaming: false,
                    thinking: false
                  };
                }
                return newMessages;
              });
              return;
            }

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantContent += parsed.content;

                  setMessages((m) => {
                    const newMessages = [...m];
                    if (newMessages[assistantMessageIndex]) {
                      newMessages[assistantMessageIndex] = {
                        ...newMessages[assistantMessageIndex],
                        content: assistantContent,
                        thinking: false // Remove thinking state when content arrives
                      };
                    }
                    return newMessages;
                  });
                }              if (parsed.error) {
                throw new Error(parsed.content || 'Streaming error');
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((m) => {
        const newMessages = [...m];
        if (newMessages[assistantMessageIndex]) {
          newMessages[assistantMessageIndex] = {
            role: 'assistant',
            content: `I apologize, but I encountered an error: ${error.message}. Please make sure Ollama is running locally and try again.`,
            streaming: false,
            thinking: false,
            error: true
          };
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  };

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="min-h-screen"
    >
      <div className="flex flex-col h-screen bg-gray-100 p-4 space-y-4">

        <DashboardHeader setModVis={() => { setModVis(true); }} toggleChat={toggleChat} />

        {
          modVis === true
            ? <div className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4'>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className='bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden'
              >
                {/* Header */}
                <div className='bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h2 className='text-2xl font-bold'>Upload Dataset</h2>
                      <p className='text-blue-100 mt-1'>Import your data to create powerful visualizations</p>
                    </div>
                    <button 
                      onClick={() => setModVis(false)}
                      className='p-2 hover:bg-white/20 rounded-full transition-colors duration-200'
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className='p-8'>
                  {/* Upload Area */}
                  <div className='relative'>
                    {!selectedFile && !isUploading && !uploadSuccess && (
                      <div 
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer group ${
                          dragActive 
                            ? 'border-blue-500 bg-blue-50 scale-105' 
                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-input').click()}
                      >
                        <div className='space-y-4'>
                          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                            dragActive 
                              ? 'bg-blue-200 scale-110' 
                              : 'bg-blue-100 group-hover:bg-blue-200'
                          }`}>
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          
                          <div>
                            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                              {dragActive ? 'Drop your file here' : 'Drop your dataset here'}
                            </h3>
                            <p className='text-gray-500 text-sm'>
                              or <span className='text-blue-600 font-medium'>browse files</span> from your computer
                            </p>
                          </div>

                          <div className='flex items-center justify-center space-x-6 pt-4'>
                            <div className='flex items-center space-x-2 text-sm text-gray-600'>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>CSV</span>
                            </div>
                            <div className='flex items-center space-x-2 text-sm text-gray-600'>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>JSON</span>
                            </div>
                            <div className='flex items-center space-x-2 text-sm text-gray-600'>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>Excel</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* File Selected/Upload Progress */}
                    {(selectedFile || isUploading) && !uploadSuccess && (
                      <div className='border-2 border-blue-200 bg-blue-50 rounded-xl p-8 text-center'>
                        <div className='space-y-6'>
                          <div className='mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center'>
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          
                          {selectedFile && (
                            <div>
                              <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                                {selectedFile.name}
                              </h3>
                              <p className='text-sm text-gray-600'>
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          )}

                          {isUploading && (
                            <div className='space-y-3'>
                              <div className='text-sm font-medium text-blue-700'>
                                Uploading... {Math.round(uploadProgress)}%
                              </div>
                              <div className='w-full bg-blue-200 rounded-full h-2'>
                                <div 
                                  className='bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out'
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Upload Success */}
                    {uploadSuccess && (
                      <div className='border-2 border-green-200 bg-green-50 rounded-xl p-8 text-center'>
                        <div className='space-y-4'>
                          <div className='mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          
                          <div>
                            <h3 className='text-lg font-semibold text-green-900 mb-1'>
                              Upload Successful!
                            </h3>
                            <p className='text-sm text-green-700'>
                              Your dataset has been processed and is ready to use.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Upload Error */}
                    {uploadError && (
                      <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
                        <div className='flex items-center'>
                          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className='text-red-700 font-medium'>{uploadError}</span>
                        </div>
                      </div>
                    )}
                    
                    <input 
                      id="file-input"
                      type="file" 
                      className='hidden'
                      accept=".csv,.json,.xlsx,.xls"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                    />
                  </div>

                  {/* File Requirements */}
                  <div className='mt-8 p-4 bg-gray-50 rounded-xl'>
                    <h4 className='font-semibold text-gray-900 mb-3 flex items-center'>
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      File Requirements
                    </h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600'>
                      <div className='flex items-start space-x-2'>
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Maximum file size: 50MB</span>
                      </div>
                      <div className='flex items-start space-x-2'>
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Supported formats: CSV, JSON, Excel</span>
                      </div>
                      <div className='flex items-start space-x-2'>
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Include headers for better parsing</span>
                      </div>
                      <div className='flex items-start space-x-2'>
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Clean data recommended</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className='bg-gray-50 px-8 py-6 flex items-center justify-between'>
                  <div className='text-sm text-gray-500'>
                    Your data is processed securely and privately
                  </div>
                  <div className='flex space-x-3'>
                    <button 
                      onClick={() => setModVis(false)}
                      className='px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium'
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => document.getElementById('file-input').click()}
                      className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium'
                    >
                      Select File
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
            : null
        }

        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* LEFT */}
          <aside className="w-64 bg-white shadow-md flex flex-col rounded-2xl overflow-hidden">
            {/* CHARTS SECTION */}
            <div className="border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 px-4 pt-4">Charts</h2>
              <div className="mt-2 px-4 space-y-3 h-64 overflow-y-auto scrollbar-hide">
                <div
                  onClick={() => setVisible((v) => ({ ...v, pie: !v.pie }))}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors duration-200 ${visible.pie ? 'bg-blue-100 border-l-4 border-blue-600' : 'hover:bg-blue-50'
                    }`}
                >
                  <MdPieChart className="text-blue-600 text-2xl" />
                  <span className="text-gray-700 font-medium">Pie Chart</span>
                </div>
                <div
                  onClick={() => setVisible((v) => ({ ...v, bar: !v.bar }))}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors duration-200 ${visible.bar ? 'bg-green-100 border-l-4 border-green-600' : 'hover:bg-blue-50'
                    }`}
                >
                  <MdBarChart className="text-green-600 text-2xl" />
                  <span className="text-gray-700 font-medium">Bar Chart</span>
                </div>
                <div
                  onClick={() => setVisible((v) => ({ ...v, stack: !v.stack }))}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors duration-200 ${visible.stack ? 'bg-purple-100 border-l-4 border-purple-600' : 'hover:bg-blue-50'
                    }`}
                >
                  <MdBarChart className="text-purple-600 text-2xl" />
                  <span className="text-gray-700 font-medium">Stacked Bar</span>
                </div>
                <div
                  onClick={() => setVisible((v) => ({ ...v, line: !v.line }))}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors duration-200 ${visible.line ? 'bg-red-100 border-l-4 border-red-600' : 'hover:bg-blue-50'
                    }`}
                >
                  <MdShowChart className="text-red-600 text-2xl" />
                  <span className="text-gray-700 font-medium">Line Chart</span>
                </div>
                <div
                  onClick={() => setVisible((v) => ({ ...v, radar: !v.radar }))}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors duration-200 ${visible.radar ? 'bg-pink-100 border-l-4 border-pink-600' : 'hover:bg-blue-50'
                    }`}
                >
                  <GiRadarSweep className="text-pink-600 text-2xl" />
                  <span className="text-gray-700 font-medium">Radar Chart</span>
                </div>
                {/* add more chart toggles here */}
              </div>
            </div>

            {/* TABLES SECTION */}
            {
              modVis === "done"
                ? <div className="flex-1 px-4 py-4 overflow-y-auto scrollbar-hide">
                  <ul className="space-y-2">
                    {Object.keys(datasets).map((table) => (
                      <li
                        key={table}
                        draggable
                        onDragStart={(e) => handleDragStart(e, table)}
                        className="p-2 rounded-md cursor-pointer font-medium bg-gray-200/20 hover:bg-blue-50 transition-colors duration-200 text-gray-700 shadow-sm"
                      >
                        {table}
                      </li>
                    ))}
                  </ul>
                </div>
                : null
            }
          </aside>

          {/* CENTER */}
          <main className="flex-1">
            <div className="flex space-x-4 mb-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => setXTable(e.dataTransfer.getData("table"))}
                className="flex-1 border-2 border-dashed rounded-lg p-3 text-center h-10 flex items-center justify-center text-gray-500"
              >
                {xTable ? `X Axis Table: ${xTable}` : "Drag a table here for X Axis"}
              </div>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => setYTable(e.dataTransfer.getData("table"))}
                className="flex-1 border-2 border-dashed rounded-lg p-3 text-center h-10 flex items-center justify-center text-gray-500"
              >
                {yTable ? `Y Axis Table: ${yTable}` : "Drag a table here for Y Axis"}
              </div>
            </div>

            <div className="relative w-full h-full overflow-auto rounded-2xl overflow-x-hidden overflow-y-hidden">
              {visible.pie && (
                <Rnd
                  bounds="parent"
                  size={pieSize}
                  position={piePos}
                  onDragStop={(_, d) => setPiePos({ x: d.x, y: d.y })}
                  onResizeStop={(_, __, ref, ___, pos) => {
                    setPieSize({ width: ref.offsetWidth, height: ref.offsetHeight });
                    setPiePos(pos);
                  }}
                  minWidth={300}
                  minHeight={250}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col absolute"
                >
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Combined Pie</h2>
                  {combinedPie.length > 0 ? (
                    <ResponsiveContainer width="100%" height={pieSize.height - 60}>
                      <PieChart>
                        <Pie
                          data={combinedPie}
                          dataKey="xValue"
                          cx="30%"
                          cy="50%"
                          outerRadius={80}
                          fill="#3b82f6"
                          nameKey="name"
                          label
                        >
                          {combinedPie.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Pie
                          data={combinedPie}
                          dataKey="yValue"
                          cx="70%"
                          cy="50%"
                          outerRadius={80}
                          fill="#10b981"
                          nameKey="name"
                          label
                        >
                          {combinedPie.map((entry, index) => (
                            <Cell key={index} fill={COLORS[(index + 1) % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-400">Drag two tables above.</p>
                  )}
                </Rnd>
              )}

              {visible.line && (
                <Rnd
                  bounds="parent"
                  size={lineSize}
                  position={linePos}
                  onDragStop={(_, d) => setLinePos({ x: d.x, y: d.y })}
                  onResizeStop={(_, __, ref, ___, pos) => {
                    setLineSize({ width: ref.offsetWidth, height: ref.offsetHeight });
                    setLinePos(pos);
                  }}
                  minWidth={300}
                  minHeight={250}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col absolute"
                >
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Combined Line</h2>
                  {combinedBarLine.length > 0 ? (
                    <ResponsiveContainer width="100%" height={lineSize.height - 60}>
                      <LineChart data={combinedBarLine}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="xShipments" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="yShipments" stroke="#10b981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-400">Drag two tables above.</p>
                  )}
                </Rnd>
              )}

              {visible.radar && (
                <Rnd bounds="parent" size={radarSize} position={radarPos}
                  onDragStop={(_, d) => setRadarPos({ x: d.x, y: d.y })}
                  onResizeStop={(_, __, ref, ___, pos) => {
                    setRadarSize({ width: ref.offsetWidth, height: ref.offsetHeight });
                    setRadarPos(pos);
                  }}
                  minWidth={300} minHeight={250}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col absolute">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Combined Radar</h2>
                  {combinedPie.length > 0 ? (
                    <ResponsiveContainer width="100%" height={radarSize.height - 60}>
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={combinedPie}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" />
                        <PolarRadiusAxis />
                        <Radar name={`${xTable} Values`} dataKey="xValue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                        <Radar name={`${yTable} Values`} dataKey="yValue" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-gray-400">Drag two tables above.</p>}
                </Rnd>
              )}

              {visible.bar && (
                <Rnd
                  bounds="parent"
                  size={barSize}
                  position={barPos}
                  onDragStop={(_, d) => setBarPos({ x: d.x, y: d.y })}
                  onResizeStop={(_, __, ref, ___, pos) => {
                    setBarSize({ width: ref.offsetWidth, height: ref.offsetHeight });
                    setBarPos(pos);
                  }}
                  minWidth={300}
                  minHeight={250}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col absolute"
                >
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Combined Bar</h2>
                  {combinedBarLine.length > 0 ? (
                    <ResponsiveContainer width="100%" height={barSize.height - 60}>
                      <BarChart data={combinedBarLine}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="xShipments" fill="#3b82f6" name={`${xTable}`} />
                        <Bar dataKey="yShipments" fill="#10b981" name={`${yTable}`} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-400">Drag two tables above.</p>
                  )}
                </Rnd>
              )}

              {visible.stack && (
                <Rnd
                  bounds="parent"
                  size={stackSize}
                  position={stackPos}
                  onDragStop={(_, d) => setStackPos({ x: d.x, y: d.y })}
                  onResizeStop={(_, __, ref, ___, pos) => {
                    setStackSize({ width: ref.offsetWidth, height: ref.offsetHeight });
                    setStackPos(pos);
                  }}
                  minWidth={300}
                  minHeight={250}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col absolute"
                >
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Stacked Bar</h2>
                  {combinedBarLine.length > 0 ? (
                    <ResponsiveContainer width="100%" height={stackSize.height - 60}>
                      <BarChart data={combinedBarLine}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="xShipments" stackId="a" fill="#3b82f6" name={`${xTable}`} />
                        <Bar dataKey="yShipments" stackId="a" fill="#10b981" name={`${yTable}`} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-400">Drag two tables above.</p>
                  )}
                </Rnd>
              )}
            </div>
          </main>

          {/* RIGHT panel (chat) restored */}
          <aside style={{ width: chatOpen ? 300 : 0, transition: "width 200ms" }} className="bg-white rounded-2xl shadow-md flex flex-col">
            <div className="px-3 py-2 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800 text-center">Ask the data</h2>
              <p className="text-[12px] text-gray-500 text-center">Context-aware AI powered by Ollama</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 && (
                <div className="text-[12px] text-gray-500 text-center">
                  <div className="mb-2">🤖 AI ready to help with your data!</div>
                  <div className="text-gray-700 space-y-1">
                    <div>"What's the trend in shipments this quarter?"</div>
                    <div>"Compare Diesel vs Petrol distribution"</div>
                    <div>"Explain the bar chart data"</div>
                    <div>"Which vehicle type is most used?"</div>
                  </div>
                </div>
              )}
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg text-[13px] ${m.role === 'user'
                    ? 'bg-blue-50 text-gray-800 ml-4 border border-blue-200'
                    : m.error
                      ? 'bg-red-50 text-red-700 mr-4 border border-red-200'
                      : 'bg-gray-50 text-gray-700 mr-4 border border-gray-200'
                    }`}
                >
                  <div className="flex items-start space-x-2">
                    {m.role === 'user' ? (
                      <span className="text-blue-600 font-semibold text-xs">You:</span>
                    ) : (
                      <span className={`font-semibold text-xs ${m.error ? 'text-red-600' : 'text-green-600'}`}>
                        🤖 AI:
                      </span>
                    )}
                    <div className="flex-1">
                      {m.thinking ? (
                        <ThinkingAnimation />
                      ) : (
                        <>
                          {m.content}
                          {m.streaming && !m.thinking && (
                            <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1">|</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2 border-t border-gray-200">
              {/* Context indicator */}
              <div className="flex items-center justify-between mb-2 text-[10px] text-gray-500">
                <div className="flex items-center space-x-1">
                  <span>📊 Context:</span>
                  <span className="text-blue-600">
                    {[xTable, yTable].filter(Boolean).join(' + ') || 'No tables'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>📈 Charts:</span>
                  <span className="text-green-600">
                    {Object.entries(visible).filter(([_, v]) => v).length}
                  </span>
                </div>
              </div>

              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Ask about your data and charts..."
                  className="flex-1 bg-transparent outline-none px-1 text-[13px] text-gray-800"
                  disabled={loading}
                />
                <button
                  disabled={loading || !query.trim()}
                  className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full text-[12px] font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSend}
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </motion.div>
  );
}
