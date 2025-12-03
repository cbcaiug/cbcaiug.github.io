/**
 * js/components/AuthModal.js
 * 
 * Authentication modal for sign-in/sign-up with dark glass theme
 */

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = React.useState('signin');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        await FirebaseService.auth.createUserWithEmailAndPassword(email, password);
      } else {
        await FirebaseService.auth.signInWithEmailAndPassword(email, password);
      }
      onAuthSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await FirebaseService.auth.signInWithPopup(provider);
      onAuthSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleAnonymousSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await FirebaseService.auth.signInAnonymously();
      // Set guest quotas (5 downloads, 5 messages)
      await FirebaseService.db.collection('users').doc(result.user.uid).set({
        downloadsLeft: 5,
        messagesLeft: 5,
        isGuest: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      onAuthSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src="https://raw.githubusercontent.com/derikmusa/derikmusa.github.io/a8d098a0d2e51d472cf4291b37e02d4f26f7d642/cbc-ai-tool-logo.jpeg" 
            alt="CBC AI Tool" 
            className="w-20 h-20 rounded-full border-2 border-white/20 shadow-lg"
          />
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4 text-sm backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm"
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm"
            required
            disabled={loading}
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transition-all"
          >
            {loading ? 'Please wait...' : mode === 'signup' ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-slate-900 text-gray-400">OR</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white/10 border border-white/20 p-3 rounded-lg hover:bg-white/20 flex items-center justify-center gap-3 mb-3 disabled:opacity-50 transition-all backdrop-blur-sm group"
        >
          <svg className="w-6 h-6" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          <span className="text-white font-semibold">Continue with Google</span>
        </button>

        <button
          onClick={handleAnonymousSignIn}
          disabled={loading}
          className="w-full bg-white/5 border border-white/10 text-gray-300 p-3 rounded-lg hover:bg-white/10 font-semibold disabled:opacity-50 transition-all backdrop-blur-sm"
        >
          Continue as Guest (5 free uses)
        </button>

        <p className="mt-6 text-center text-sm text-gray-400">
          {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-indigo-400 hover:text-indigo-300 hover:underline font-semibold transition-colors"
            disabled={loading}
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};
