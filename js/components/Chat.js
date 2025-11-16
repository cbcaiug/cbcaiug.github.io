/**
 * js/components/Chat.js
 *
 * This file contains the UI components specifically related to the chat message area,
 * such as the markdown renderer and the message options menu.
 */

const { useState, useEffect, useRef } = React;

const MarkdownRenderer = ({ htmlContent, isLoading, isTakingLong }) => {
    const contentRef = useRef(null);

    // This effect is for adding a scroll guide to wide tables after the content has rendered.
    useEffect(() => {
        if (contentRef.current) {
            const tables = contentRef.current.querySelectorAll('table');
            tables.forEach(table => {
                // Remove any existing guide to prevent duplicates on re-render
                const existingGuide = table.nextElementSibling;
                if (existingGuide && existingGuide.classList.contains('scroll-guide')) {
                    existingGuide.remove();
                }

                // If the table is wider than its container, add the guide
                if (table.scrollWidth > table.clientWidth) {
                    const guide = document.createElement('p');
                    guide.innerHTML = '<em>&laquo;&mdash; Scroll left and right to view more content &mdash;&raquo;</em>';
                    guide.className = 'text-center text-slate-500 text-sm mt-1 scroll-guide italic';
                    table.parentNode.insertBefore(guide, table.nextSibling);
                }
            });
        }
    }, [htmlContent, isLoading]); // Re-run when content changes or loading state changes

    // Display a loading message if the AI is thinking and no content has arrived yet.
    if (isLoading && !htmlContent.trim().replace(/<p><\/p>/g, '')) {
        return (
            <div className="p-4 flex items-center text-slate-500">
                <div className="loading-spinner mr-3"></div>
                <span className="font-medium">
                    {isTakingLong ? "CBC AI is taking a bit longer than usual..." : "CBC AI is thinking..."}
                </span>
            </div>
        );
    }
    
    // Append the flashing cursor indicator while streaming
    const finalHtml = htmlContent + (isLoading ? '<span class="streaming-indicator"></span>' : '');
    return <div ref={contentRef} className="markdown-content p-4" dangerouslySetInnerHTML={{ __html: finalHtml }} />;
};

const MessageMenu = ({ msg, index, onCopy, onShare, onDelete, onRegenerate, onDocxDownload, usageCount }) => {
  // Don't render the menu for a message that is still loading
  if (msg.isLoading) return null;

  const isLimitReached = usageCount <= 0;
  const copyButtonClass = isLimitReached 
    ? "flex items-center gap-1 px-2 py-1 text-xs text-slate-400 cursor-not-allowed rounded"
    : "flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors";
  const saveButtonClass = isLimitReached
    ? "flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
    : "flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors";

  return (
      <div className="flex flex-wrap items-center justify-end gap-1 mt-2 px-2 sm:px-4 pb-2" id={`message-options-menu-${index}`}>
          <button
              onClick={() => !isLimitReached && onCopy(msg.content)}
              className={copyButtonClass}
              disabled={isLimitReached}
              title={isLimitReached ? "Free uses exhausted" : "Copy Message"}
          >
              <CopyIcon className="w-3 h-3" />
              <span>Copy {usageCount}/20</span>
          </button>
          
          {msg.role === 'assistant' && (
              <button
                  onClick={() => onDocxDownload(msg.content)}
                  className={saveButtonClass}
                  title={isLimitReached ? "Free uses exhausted - Add to cart" : "Save as Google Doc"}
              >
                  <FileTextIcon className="w-3 h-3" />
                  <span>Save {usageCount}/20</span>
              </button>
          )}
          
          <button
              onClick={() => onShare({ title: 'AI Assistant Response', text: msg.content })}
              className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
              title="Share Message"
          >
              <Share2Icon className="w-3 h-3" />
              <span>Share</span>
          </button>
          
          {msg.role === 'assistant' && (
              <button
                  onClick={() => onRegenerate(index)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                  title="Regenerate Response"
              >
                  <RefreshCwIcon className="w-3 h-3" />
                  <span>Regenerate</span>
              </button>
          )}
          
          <button
              onClick={() => onDelete(index)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
              title="Delete Message"
          >
              <TrashIcon className="w-3 h-3" />
              <span>Delete</span>
          </button>
      </div>
  );
};