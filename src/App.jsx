import React, { useState, useEffect } from 'react';
import { Check, X, Plus, LogOut, Trash2, CheckCircle2, Circle, Edit2 } from 'lucide-react';

// Simple Confetti Component
function Confetti() {
  const confettiCount = 50;
  const colors = ['#f9b17a', '#676f9d', '#ffffff', '#424769'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(confettiCount)].map((_, i) => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomLeft = Math.random() * 100;
        const randomDelay = Math.random() * 0.5;
        const randomDuration = 2 + Math.random() * 1;
        
        return (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${randomLeft}%`,
              top: '-10px',
              width: '10px',
              height: '10px',
              backgroundColor: randomColor,
              borderRadius: Math.random() > 0.5 ? '50%' : '0',
              animation: `fall ${randomDuration}s linear ${randomDelay}s forwards`,
              opacity: 0.8
            }}
          />
        );
      })}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default function TodoApp() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      loadTodos(userData.email);
    }
  }, []);

  const loadTodos = (userEmail) => {
    const savedTodos = localStorage.getItem(`todos_${userEmail}`);
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  };

  const saveTodos = (userEmail, todosToSave) => {
    localStorage.setItem(`todos_${userEmail}`, JSON.stringify(todosToSave));
  };

  const handleAuth = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (isSignUp) {
      if (users[email]) {
        setError('User already exists');
        return;
      }
      users[email] = { email, password };
      localStorage.setItem('users', JSON.stringify(users));
      const userData = { email };
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      loadTodos(email);
    } else {
      if (!users[email] || users[email].password !== password) {
        setError('Invalid credentials');
        return;
      }
      const userData = { email };
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      loadTodos(email);
    }

    setEmail('');
    setPassword('');
  };

  const handleLogout = () => {
    setUser(null);
    setTodos([]);
    localStorage.removeItem('currentUser');
  };

  const addTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const todo = {
      id: Date.now(),
      text: newTodo,
      completed: false,
      createdAt: new Date().toISOString()
    };

    const updatedTodos = [...todos, todo];
    setTodos(updatedTodos);
    saveTodos(user.email, updatedTodos);
    setNewTodo('');
  };

  const toggleTodo = (id) => {
    const todo = todos.find(t => t.id === id);
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    saveTodos(user.email, updatedTodos);
    
    // Show confetti when completing a task (not when uncompleting)
    if (todo && !todo.completed) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const deleteTodo = (id) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    saveTodos(user.email, updatedTodos);
  };

  const startEdit = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = (id) => {
    if (!editText.trim()) return;
    
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, text: editText } : todo
    );
    setTodos(updatedTodos);
    saveTodos(user.email, updatedTodos);
    setEditingId(null);
    setEditText('');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#2d3250' }}>
        
        <div className="relative backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md" style={{ backgroundColor: '#424769' }}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg" style={{ backgroundColor: '#f9b17a' }}>
              <CheckCircle2 className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p style={{ color: '#676f9d' }}>
              {isSignUp ? 'Sign up to organize your life' : 'Sign in to continue'}
            </p>
          </div>

          {error && (
            <div className="border-l-4 px-4 py-3 rounded-lg mb-6 shadow-sm" style={{ backgroundColor: '#424769', borderColor: '#f9b17a' }}>
              <p className="font-medium" style={{ color: '#f9b17a' }}>{error}</p>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAuth(e)}
                className="w-full px-4 py-3 border-2 rounded-xl outline-none transition-all"
                style={{ 
                  backgroundColor: '#2d3250', 
                  borderColor: '#676f9d',
                  color: '#ffffff'
                }}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAuth(e)}
                className="w-full px-4 py-3 border-2 rounded-xl outline-none transition-all"
                style={{ 
                  backgroundColor: '#2d3250', 
                  borderColor: '#676f9d',
                  color: '#ffffff'
                }}
                placeholder="••••••••"
              />
            </div>

            <button
              onClick={handleAuth}
              className="w-full text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              style={{ backgroundColor: '#f9b17a' }}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p style={{ color: '#676f9d' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="font-semibold underline-offset-2 hover:underline"
                style={{ color: '#f9b17a' }}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeTodos = todos.filter(t => !t.completed).length;
  const completedTodos = todos.filter(t => t.completed).length;

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#2d3250' }}>
      {showConfetti && <Confetti />}
      
      <div className="relative max-w-3xl mx-auto pt-8 pb-12">
        {/* Header Card */}
        <div className="backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-6" style={{ backgroundColor: '#424769' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#f9b17a' }}>
                <CheckCircle2 className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>My Tasks</h1>
                <p className="text-sm" style={{ color: '#676f9d' }}>{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
              style={{ color: '#f9b17a' }}
            >
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="backdrop-blur-sm rounded-2xl shadow-lg p-4" style={{ backgroundColor: '#424769' }}>
            <p className="text-sm font-medium mb-1" style={{ color: '#676f9d' }}>Total</p>
            <p className="text-3xl font-bold" style={{ color: '#ffffff' }}>{todos.length}</p>
          </div>
          <div className="backdrop-blur-sm rounded-2xl shadow-lg p-4" style={{ backgroundColor: '#424769' }}>
            <p className="text-sm font-medium mb-1" style={{ color: '#676f9d' }}>Active</p>
            <p className="text-3xl font-bold" style={{ color: '#f9b17a' }}>{activeTodos}</p>
          </div>
          <div className="backdrop-blur-sm rounded-2xl shadow-lg p-4" style={{ backgroundColor: '#424769' }}>
            <p className="text-sm font-medium mb-1" style={{ color: '#676f9d' }}>Done</p>
            <p className="text-3xl font-bold" style={{ color: '#f9b17a' }}>{completedTodos}</p>
          </div>
        </div>

        {/* Add Todo Card */}
        <div className="backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-6" style={{ backgroundColor: '#424769' }}>
          <div className="flex gap-3">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo(e)}
              placeholder="What do you need to do?"
              className="flex-1 px-5 py-4 border-2 rounded-2xl outline-none text-lg transition-all"
              style={{ 
                backgroundColor: '#2d3250', 
                borderColor: '#676f9d',
                color: '#ffffff'
              }}
            />
            <button
              onClick={addTodo}
              className="text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
              style={{ backgroundColor: '#f9b17a' }}
            >
              <Plus size={22} />
              Add
            </button>
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <div className="backdrop-blur-sm rounded-3xl shadow-2xl p-16 text-center" style={{ backgroundColor: '#424769' }}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ backgroundColor: '#2d3250' }}>
                <Circle style={{ color: '#676f9d' }} size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#ffffff' }}>No tasks yet</h3>
              <p style={{ color: '#676f9d' }}>Add your first task to get started!</p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="backdrop-blur-sm rounded-2xl shadow-lg p-5 flex items-center gap-4 hover:shadow-xl transition-all duration-200 group"
                style={{ backgroundColor: '#424769' }}
              >
                {editingId === todo.id ? (
                  <>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') saveEdit(todo.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="flex-1 px-4 py-2 border-2 rounded-xl outline-none text-lg"
                      style={{ 
                        backgroundColor: '#2d3250', 
                        borderColor: '#f9b17a',
                        color: '#ffffff'
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(todo.id)}
                      className="flex-shrink-0 p-2.5 rounded-xl transition-all"
                      style={{ color: '#f9b17a' }}
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-shrink-0 p-2.5 rounded-xl transition-all"
                      style={{ color: '#676f9d' }}
                    >
                      <X size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200`}
                      style={{
                        backgroundColor: todo.completed ? '#f9b17a' : 'transparent',
                        borderColor: todo.completed ? '#f9b17a' : '#676f9d'
                      }}
                    >
                      {todo.completed && <Check size={16} className="text-white" strokeWidth={3} />}
                    </button>

                    <span
                      className={`flex-1 text-lg transition-all duration-200 ${
                        todo.completed ? 'line-through' : 'font-medium'
                      }`}
                      style={{ color: todo.completed ? '#676f9d' : '#ffffff' }}
                    >
                      {todo.text}
                    </span>

                    <button
                      onClick={() => startEdit(todo.id, todo.text)}
                      className="flex-shrink-0 p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      style={{ color: '#f9b17a' }}
                    >
                      <Edit2 size={20} />
                    </button>

                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="flex-shrink-0 p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      style={{ color: '#f9b17a' }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}