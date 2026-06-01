'use client';

import React from 'react';

interface AnimatedTextProps {
  text: string;
  className?: string;
}

export const AnimatedText = ({ text, className }: AnimatedTextProps) => {
  const words = text.split(' ');
  let charCount = 0;

  return (
    <span className={className}>
      {words.map((word, wordIndex) => {
        const letters = word.split('');
        return (
          <React.Fragment key={wordIndex}>
            <span style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
              {letters.map((letter, letterIndex) => {
                const delay = charCount++ * 0.03;
                return (
                  <span
                    key={letterIndex}
                    className="letter-blur"
                    style={{ 
                      animationDelay: `${delay}s`, 
                      display: 'inline-block'
                    }}
                  >
                    {letter}
                  </span>
                );
              })}
            </span>
            {/* Space between words - outside the nowrap span to allow wrapping */}
            {wordIndex < words.length - 1 && (
              <span className="letter-blur" style={{ animationDelay: `${charCount++ * 0.03}s` }}>
                &nbsp;
              </span>
            )}
          </React.Fragment>
        );
      })}
    </span>
  );
};
