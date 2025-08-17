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
                    {isTakingLong ? "AI is taking a bit longer than usual..." : "AI is thinking..."}
                </span>
            </div>
        );
    }
    
    // Append the flashing cursor indicator while streaming
    const finalHtml = htmlContent + (isLoading ? '<span class="streaming-indicator"></span>' : '');
    return <div ref={contentRef} className="markdown-content p-4" dangerouslySetInnerHTML={{ __html: finalHtml }} />;
};

const MessageMenu = ({ msg, index, onCopy, onShare, onDelete, onRegenerate, onDocxDownload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Effect to handle clicking outside of the menu to close it
  useEffect(() => {
      const handleClickOutside = (event) => {
          if (menuRef.current && !menuRef.current.contains(event.target)) {
              setIsOpen(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  // Don't render the menu for a message that is still loading
  if (msg.isLoading) return null;
  
  const menuPositionClass = 'right-0'; // Keep the menu position consistent

  return (
      <div className="relative self-end mt-1" ref={menuRef} id={`message-options-menu-${index}`}>
          <button
              onClick={() => setIsOpen(prev => !prev)}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-500"
              title="Options"
          >
              <MoreVerticalIcon className="w-5 h-5" />
          </button>
          {isOpen && (
              <div className={`absolute ${menuPositionClass} bottom-full mb-2 w-52 bg-white rounded-md shadow-lg z-20 border border-slate-200`}>
                  <button
                      onClick={() => { onCopy(msg.content); setIsOpen(false); }}
                      className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                      <CopyIcon className="w-4 h-4" />
                      <span>Copy Message</span>
                  </button>
                  {msg.role === 'assistant' && (
                     <button
                        onClick={() => { onDocxDownload(msg.content); setIsOpen(false); }}
                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                        <FileTextIcon className="w-4 h-4" />
                        <span>Download as .docx</span>
                    </button>
                  )}
                  <button
                      onClick={() => { onShare({ title: 'AI Assistant Response', text: msg.content }); setIsOpen(false); }}
                      className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                      <Share2Icon className="w-4 h-4" />
                      <span>Share Message</span>
                  </button>
                  {msg.role === 'assistant' && (
                      <button
                          onClick={() => { onRegenerate(index); setIsOpen(false); }}
                          className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                          <RefreshCwIcon className="w-4 h-4" />
                          <span>Regenerate</span>
                      </button>
                  )}
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                      onClick={() => { onDelete(index); setIsOpen(false); }}
                      className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                      <TrashIcon className="w-4 h-4" />
                      <span>Delete Message</span>
                  </button>
              </div>
          )}
      </div>
  );
};