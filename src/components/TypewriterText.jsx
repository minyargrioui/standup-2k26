import { useState, useEffect } from 'react';

export default function TypewriterText({ 
  lines, 
  speed = 50, 
  delayBetweenLines = 1000,
  trigger = true, // New prop to control when animation starts
  onComplete 
}) {
  const [displayedLines, setDisplayedLines] = useState(lines.map(() => ''));
  const [currentLine, setCurrentLine] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (trigger && !hasStarted) {
      setHasStarted(true);
    }
  }, [trigger, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    if (currentLine < lines.length) {
      if (currentIndex < lines[currentLine].length) {
        const timeout = setTimeout(() => {
          const newLines = [...displayedLines];
          newLines[currentLine] = lines[currentLine].substring(0, currentIndex + 1);
          setDisplayedLines(newLines);
          setCurrentIndex(currentIndex + 1);
        }, speed);
        
        return () => clearTimeout(timeout);
      } else if (currentLine < lines.length - 1) {
        const timeout = setTimeout(() => {
          setCurrentLine(currentLine + 1);
          setCurrentIndex(0);
        }, delayBetweenLines);
        
        return () => clearTimeout(timeout);
      } else if (onComplete) {
        onComplete();
      }
    }
  }, [currentLine, currentIndex, lines, speed, delayBetweenLines, hasStarted, onComplete, displayedLines]);

  return (
    <div>
      {displayedLines.map((line, idx) => (
        <div key={idx}>
          {line}
          {idx === currentLine && hasStarted && currentIndex < lines[currentLine]?.length && (
            <span className="cursor">|</span>
          )}
        </div>
      ))}
    </div>
  );
}