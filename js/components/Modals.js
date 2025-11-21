/**
 * js/components/Modals.js
 *
 * This file contains all modal dialog and overlay components used in the application,
 * such as the loading screen, feedback form, update banner, and consent dialog.
 */

const { useState } = React;

// --- REACT COMPONENTS ---

const LoadingScreen = ({ text }) => (
    <div className="loading-screen-container">
        <div className="loading-logo-wrapper">
            <img src="https://raw.githubusercontent.com/derikmusa/derikmusa.github.io/a8d098a0d2e51d472cf4291b37e02d4f26f7d642/cbc-ai-tool-logo.jpeg" alt="Loading Logo" className="loading-logo-img" />
        </div>
        <p className="loading-screen-text">{text}</p>
    </div>
);

const FeedbackModal = ({ isOpen, onClose, onSubmit, assistantName }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleEmailChange = (e) => {
      const newEmail = e.target.value;
      setEmail(newEmail);
      if (newEmail === '') {
          setIsEmailValid(null);
      } else {
          setIsEmailValid(emailRegex.test(newEmail));
      }
  };

  const handleSubmit = async () => {
    if ((rating === 0 && email === '') || (email !== '' && !isEmailValid)) return;
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      // The actual submission is handled by a function passed via props
      await onSubmit({ rating: rating > 0 ? rating : null, feedbackText, assistantName, email: isEmailValid ? email : null });
      setSubmitStatus('success');
      setTimeout(() => {
          onClose();
          // Reset state for the next time it opens
          setSubmitStatus(null);
          setRating(0);
          setFeedbackText('');
          setEmail('');
          setIsEmailValid(null);
      }, 2000);
    } catch (error) {
      console.error("Submission failed:", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
      trackEvent('feedback_skipped', assistantName);
      onClose();
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 max-w-md w-full transform transition-all scale-100 opacity-100">
              {submitStatus === 'success' ? (
                  <div className="text-center py-8">
                      <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-slate-800">Thank You!</h2>
                      <p className="text-slate-600 mt-2">Your submission has been received.</p>
                  </div>
              ) : (
                  <>
                      <h2 className="text-2xl font-bold text-slate-800 text-center">Enjoying the App?</h2>
                      <p className="text-slate-600 text-center mt-2 mb-6">Your feedback helps improve this tool. Please rate your experience or sign up for updates.</p>

                      <div className="flex justify-center items-center mb-6 star-rating" onMouseLeave={() => setHoverRating(0)}>
                          {[1, 2, 3, 4, 5].map(star => (
                              <div key={star} onMouseEnter={() => setHoverRating(star)} onClick={() => setRating(star)}>
                                  <StarIcon className={`w-10 h-10 star ${(hoverRating >= star) ? 'hover' : ''} ${rating >= star ? 'selected' : ''}`} style={{fill: 'currentColor'}}/>
                              </div>
                          ))}
                      </div>

                      <textarea
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Optional: Tell me more about your experience..."
                          className="w-full mt-1 p-3 bg-slate-100 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                          rows="3"
                      />

                      <div className="mt-4">
                          <label htmlFor="email-signup" className="text-sm font-medium text-slate-700">Get notified about future updates</label>
                          <div className="relative mt-1">
                              <input
                                  id="email-signup"
                                  type="email"
                                  value={email}
                                  onChange={handleEmailChange}
                                  placeholder="your.email@example.com"
                                  className={`w-full p-3 pr-10 bg-slate-100 border rounded-md focus:outline-none focus:ring-2 transition ${isEmailValid === true ? 'border-green-500 focus:ring-green-500' : isEmailValid === false ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                  {isEmailValid === true && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                                  {isEmailValid === false && <AlertCircleIcon className="w-5 h-5 text-red-500" />}
                              </div>
                          </div>
                      </div>

                      {submitStatus === 'error' && <p className="text-red-600 text-sm mt-2 text-center">Sorry, something went wrong. Please try again.</p>}

                      <div className="mt-6 flex flex-col sm:flex-row gap-3">
                          <button onClick={handleClose} className="w-full px-6 py-3 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors">
                              Not Now
                          </button>
                          <button onClick={handleSubmit} disabled={(rating === 0 && !isEmailValid) || isSubmitting} className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                              {isSubmitting && <div className="loading-spinner !border-white !border-t-transparent"></div>}
                              Submit
                          </button>
                      </div>
                  </>
              )}
          </div>
      </div>
  );
};

const UpdateBanner = ({ latestUpdate, onDismiss }) => {
    if (!latestUpdate) return null;

    return (
        <div className="bg-indigo-600 text-white p-3 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
                <BellIcon className="w-6 h-6 shrink-0"/>
                <p className="text-sm font-medium">
                    <span className="font-bold mr-2">New Update:</span>
                    {latestUpdate.message}
                    {latestUpdate.url && <a href={latestUpdate.url} target="_blank" rel="noopener noreferrer" className="ml-2 underline hover:opacity-80">Learn more &raquo;</a>}
                </p>
            </div>
            <button id="update-banner-close-btn" onClick={onDismiss} className="p-1 rounded-full hover:bg-indigo-500">
                <XIcon className="w-5 h-5"/>
            </button>
        </div>
    );
};

const ConsentModal = ({ onAccept }) => {
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);

    const canProceed = termsAccepted && privacyAccepted;

    return (
        <div className="consent-modal-overlay">
            <div className="consent-modal-content">
                <div className="flex items-center gap-3 mb-4">
                     <img src="https://raw.githubusercontent.com/derikmusa/derikmusa.github.io/a8d098a0d2e51d472cf4291b37e02d4f26f7d642/cbc-ai-tool-logo.jpeg" alt="Logo" className="h-12 w-12 rounded-lg"/>
                     <h2 className="text-2xl font-bold text-slate-800">Welcome!</h2>
                </div>
                <p className="text-slate-600 mb-4 text-sm">Before you begin, please review and agree to our terms of use.</p>
                
                <div className="bg-slate-50 p-3 rounded-md mb-4">
                    <p className="text-xs text-slate-500">
                        This site uses your browser's local storage to save chat history and settings. We also use analytics to improve the service. By continuing, you acknowledge this.
                    </p>
                </div>

                <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                        <span className="text-sm text-slate-700">
                            I have read and agree to the <a href="terms.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold hover:underline">Terms of Service</a>.
                        </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={privacyAccepted} onChange={() => setPrivacyAccepted(!privacyAccepted)} className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                        <span className="text-sm text-slate-700">
                           I acknowledge the <a href="privacy.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold hover:underline">Privacy Policy</a>.
                        </span>
                    </label>
                </div>

                <button 
                    onClick={onAccept} 
                    disabled={!canProceed} 
                    className="w-full mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed"
                >
                    Proceed to App
                </button>
            </div>
        </div>
    );
};
// NEW: Modal to show when user runs out of free uses
const LimitReachedModal = ({ isOpen, onClose, onAddToCart, onRemoveFromCart, itemType, inCart }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 max-w-md w-full">
                {inCart ? (
                    <div className="text-center">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-800">Already in Cart</h2>
                        <p className="text-slate-600 mt-2">This item is already in your cart. Remove it?</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <AlertCircleIcon className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-800">Free Uses Exhausted</h2>
                        <p className="text-slate-600 mt-2">You've used all 5 free {itemType}s. Add this item to your cart to continue.</p>
                        <p className="text-sm text-slate-500 mt-2">Price: 1,000 UGX per item</p>
                    </div>
                )}

                <div className="mt-6 space-y-3">
                    {inCart ? (
                        <button 
                            onClick={onRemoveFromCart}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
                        >
                            <TrashIcon className="w-5 h-5" />
                            Remove from Cart
                        </button>
                    ) : (
                        <button 
                            onClick={onAddToCart}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                        >
                            <ShoppingCartIcon className="w-5 h-5" />
                            Add to Cart (1,000 UGX)
                        </button>
                    )}
                    <button 
                        onClick={onClose}
                        className="w-full px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// NEW: Cart Modal to show items and checkout
const CartModal = ({ isOpen, onClose, cartItems, onRemoveItem, onCheckout }) => {
    if (!isOpen) return null;

    const total = cartItems.length * 1000;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">Your Cart</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
                        <XIcon className="w-6 h-6 text-slate-600" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <ShoppingCartIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                            <p>Your cart is empty</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cartItems.map((item, index) => (
                                <div key={item.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-800">Item #{index + 1}</p>
                                            <p className="text-sm text-slate-600">{item.assistantName}</p>
                                            <p className="text-xs text-slate-500 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-800">1,000 UGX</p>
                                            <button 
                                                onClick={() => onRemoveItem(item.id)}
                                                className="mt-2 text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                                            >
                                                <TrashIcon className="w-3 h-3" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="p-6 border-t border-slate-200 bg-slate-50">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-semibold text-slate-800">Total:</span>
                            <span className="text-2xl font-bold text-indigo-600">{total.toLocaleString()} UGX</span>
                        </div>
                        <div className="space-y-2">
                            <button 
                                onClick={onCheckout}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                            >
                                Proceed to Checkout
                            </button>
                            <button 
                                onClick={() => {
                                    if (confirm('Clear all items from cart?')) {
                                        cartItems.forEach(item => onRemoveItem(item.id));
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
                            >
                                <TrashIcon className="w-4 h-4" />
                                Clear Cart
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// NEW: Modal to show after a Google Doc is created successfully.
// It provides direct links to view or download the document.
const DocSuccessModal = ({ isOpen, onClose, docInfo }) => {
    if (!isOpen || !docInfo) return null;

    const handleDownload = (format) => {
        // Use backend proxy for downloads to ensure proper headers on mobile
        const downloadUrl = `${GAS_WEB_APP_URL}?action=downloadDoc&docId=${docInfo.id}&format=${format}`;
        
        // Track the download attempt
        trackEvent('doc_download_attempt', 'Document Download', { 
            docId: docInfo.id, 
            format: format 
        });
        
        // Open in new window to trigger download
        window.open(downloadUrl, '_blank');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 max-w-md w-full transform transition-all scale-100 opacity-100">
                <div className="text-center">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800">Document Created!</h2>
                    <p className="text-slate-600 mt-2">Your document is ready. You can now view it online or download it directly.</p>
                </div>

                <div className="mt-6 space-y-3">
                    {/* Button to view the document in a new tab */}
                    <a 
                        href={docInfo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                    >
                        <FileTextIcon className="w-5 h-5" />
                        <span>View in Google Docs</span>
                    </a>

                    {/* Button to download as .docx */}
                    <button 
                        onClick={() => handleDownload('docx')}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors"
                    >
                        <DownloadCloudIcon className="w-5 h-5" />
                        <span>Download as Word (.docx)</span>
                    </button>

                    {/* Button to download as .pdf */}
                    <button 
                        onClick={() => handleDownload('pdf')}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                    >
                        <DownloadCloudIcon className="w-5 h-5" />
                        <span>Download as PDF</span>
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <button onClick={onClose} className="w-full sm:w-auto px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};