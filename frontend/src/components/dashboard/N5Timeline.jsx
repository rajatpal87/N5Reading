import { useState, useEffect, useRef } from 'react';

export default function N5Timeline({ timeline, onSegmentClick }) {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const segmentRefs = useRef({});

  // Auto-scroll hovered segment into view
  useEffect(() => {
    if (hoveredSegment) {
      const key = `${hoveredSegment.start}-${hoveredSegment.end}`;
      const element = segmentRefs.current[key];
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  }, [hoveredSegment]);

  if (!timeline || !timeline.segments || timeline.segments.length === 0) {
    return null;
  }

  const segments = timeline.segments;
  const duration = timeline.duration;
  const recommended = timeline.recommended || [];

  // Get color class based on density (direct calculation for better granularity)
  const getColorClass = (segment) => {
    const density = segment.density || 0;
    if (density >= 15) return 'bg-green-600 hover:bg-green-700'; // High N5 content
    if (density >= 8) return 'bg-yellow-500 hover:bg-yellow-600'; // Medium N5 content
    if (density >= 5) return 'bg-orange-400 hover:bg-orange-500'; // Low-medium N5 content
    return 'bg-gray-300 hover:bg-gray-400'; // Very low N5 content
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      <div className="p-4 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
          🎯 N5 Content Timeline
        </h3>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>High (15%+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Medium (8-15%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-orange-400 rounded"></div>
            <span>Low (5-8%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span>Very Low (&lt;5%)</span>
          </div>
          <div className="flex items-center gap-1.5 ml-2 px-2 py-1 bg-blue-50 rounded border border-blue-200">
            <span className="text-blue-600">⭐</span>
            <span className="text-blue-700 font-medium">Best Segments</span>
          </div>
          <span className="text-gray-500 ml-auto">Overall: {timeline.overall_density}%</span>
        </div>

        {/* Timeline Bar */}
        <div className="relative">
          <div className="flex h-8 rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm">
            {segments.map((segment, idx) => {
              const widthPercent = ((segment.end - segment.start) / duration) * 100;
              // Check if this segment is in recommended list
              const isRecommended = recommended.some(rec => 
                rec.start === segment.start && rec.end === segment.end
              );
              // Check if this segment is being hovered (from card or timeline)
              const isHovered = hoveredSegment && 
                hoveredSegment.start === segment.start && 
                hoveredSegment.end === segment.end;
              
              return (
                <button
                  key={idx}
                  onClick={() => onSegmentClick(segment.start)}
                  onMouseEnter={() => setHoveredSegment(segment)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  className={`${getColorClass(segment)} transition-all relative group ${
                    isRecommended ? 'ring-2 ring-blue-500 ring-inset z-10' : ''
                  } ${
                    isHovered ? 'ring-4 ring-blue-600 ring-inset scale-105 z-20 shadow-lg' : ''
                  }`}
                  style={{ width: `${widthPercent}%` }}
                  title={`${formatTime(segment.start)} - ${formatTime(segment.end)}\nN5 Density: ${segment.density}%\n${segment.n5_word_count} words, ${segment.n5_grammar_count} grammar${isRecommended ? '\n⭐ RECOMMENDED SEGMENT' : ''}`}
                >
                  {/* Star badge for recommended segments */}
                  {isRecommended && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs rounded-full shadow-md">
                        ⭐
                      </span>
                    </div>
                  )}
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                    <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap shadow-lg">
                      <div className="font-semibold">{formatTime(segment.start)} - {formatTime(segment.end)}</div>
                      <div>Density: {segment.density}%</div>
                      <div>{segment.n5_word_count} words | {segment.n5_grammar_count} grammar</div>
                      {isRecommended && <div className="text-blue-300 font-semibold mt-1">⭐ Best for Study</div>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Time markers */}
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0:00</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Recommended Segments - Scrollable Section */}
      {recommended.length > 0 && (
        <div className="flex-1 flex flex-col min-h-0 border-t border-gray-200">
          <div className="px-4 pt-3 pb-2 flex-shrink-0">
            <h4 className="font-semibold text-gray-800 text-xs">🎯 Best segments:</h4>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-2">
            <div className="grid grid-cols-1 gap-2">
              {recommended.map((rec, idx) => {
                // Check if this card's segment is being hovered
                const isHovered = hoveredSegment && 
                  hoveredSegment.start === rec.start && 
                  hoveredSegment.end === rec.end;
                
                // Create unique key for ref
                const refKey = `${rec.start}-${rec.end}`;
                
                return (
                  <button
                    key={idx}
                    ref={(el) => (segmentRefs.current[refKey] = el)}
                    onClick={() => onSegmentClick(rec.start)}
                    onMouseEnter={() => setHoveredSegment(rec)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    className={`text-left border rounded p-2 transition-all ${
                      isHovered 
                        ? 'border-blue-500 bg-blue-100 shadow-lg scale-105 ring-2 ring-blue-400' 
                        : 'border-green-200 bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    {/* Header: Rank and Density */}
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${
                        isHovered ? 'text-blue-700' : 'text-green-700'
                      }`}>
                        #{idx + 1} Best Segment
                      </span>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        isHovered 
                          ? 'text-blue-700 bg-blue-200' 
                          : 'text-white bg-green-600'
                      }`}>
                        {rec.density}% N5
                      </span>
                    </div>
                    
                    {/* Time Range */}
                    <div className={`flex items-center gap-1.5 mb-1 font-mono text-xs ${
                      isHovered ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      <span className="font-semibold">{formatTime(rec.start)}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-semibold">{formatTime(rec.end)}</span>
                      <span className="text-gray-400 ml-auto">
                        ({Math.floor(rec.end - rec.start)}s)
                      </span>
                    </div>
                    
                    {/* Details */}
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">🟡</span>
                        <span>{rec.n5_word_count} words</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">📝</span>
                        <span>{rec.n5_grammar_count} grammar</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

