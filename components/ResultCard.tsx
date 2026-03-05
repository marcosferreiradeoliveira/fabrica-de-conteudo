
import React, { useState } from 'react';

interface ResultCardProps {
  title: string;
  icon: string;
  content: string | React.ReactNode;
  rawText?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, icon, content, rawText }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = typeof content === 'string' ? content : (rawText || '');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
            <i className={`fas ${icon} text-lg`}></i>
          </div>
          <h3 className="font-bold text-slate-800 uppercase tracking-tight text-sm">{title}</h3>
        </div>
        <button 
          onClick={handleCopy}
          className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 hover:bg-orange-600 hover:text-white transition-colors flex items-center gap-2"
        >
          {copied ? (
            <><i className="fas fa-check"></i> Copiado!</>
          ) : (
            <><i className="fas fa-copy"></i> Copiar</>
          )}
        </button>
      </div>
      <div className="p-6 flex-1 overflow-y-auto max-h-[500px] text-slate-600 leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
};

export default ResultCard;
