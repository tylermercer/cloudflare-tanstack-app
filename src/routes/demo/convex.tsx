import { useCallback, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { Trash2, Plus, Check, Circle } from 'lucide-react'

import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

export const Route = createFileRoute('/demo/convex')({
  ssr: false,
  component: ConvexTodos,
})

function ConvexTodos() {
  const todos = useQuery(api.todos.list)
  const addTodo = useMutation(api.todos.add)
  const toggleTodo = useMutation(api.todos.toggle)
  const removeTodo = useMutation(api.todos.remove)

  const [newTodo, setNewTodo] = useState('')

  const handleAddTodo = useCallback(async () => {
    if (newTodo.trim()) {
      await addTodo({ text: newTodo.trim() })
      setNewTodo('')
    }
  }, [addTodo, newTodo])

  const handleToggleTodo = useCallback(
    async (id: Id<'todos'>) => {
      await toggleTodo({ id })
    },
    [toggleTodo],
  )

  const handleRemoveTodo = useCallback(
    async (id: Id<'todos'>) => {
      await removeTodo({ id })
    },
    [removeTodo],
  )

  const completedCount = todos?.filter((todo) => todo.completed).length || 0
  const totalCount = todos?.length || 0

  return (
    <div
      style={{
        background:
          'linear-gradient(135deg, #667a56 0%, #8fbc8f 25%, #90ee90 50%, #98fb98 75%, #f0fff0 100%)',
        minHeight: '100vh',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: '42rem' }}>
        {/* Header Card */}
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '2rem', marginBottom: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(187, 247, 208, 0.5)' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#166534', marginBottom: '0.5rem' }}>
              Convex Todos
            </h1>
            <p style={{ color: '#16a34a', fontSize: '1.125rem' }}>Powered by real-time sync</p>
            {totalCount > 0 && (
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#15803d', fontWeight: 500 }}>
                  {completedCount} completed
                </span>
                <span style={{ color: '#4b5563' }}>
                  {totalCount - completedCount} remaining
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Add Todo Card */}
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '1.5rem', marginBottom: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(187, 247, 208, 0.5)' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddTodo()
                }
              }}
              placeholder="What needs to be done?"
              style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '2px solid #bbf7d0', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
            />
            <button
              onClick={handleAddTodo}
              disabled={!newTodo.trim()}
              style={{ backgroundColor: '#22c55e', color: 'white', fontWeight: 'semibold', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: newTodo.trim() ? 'pointer' : 'not-allowed' }}
            >
              <Plus size={20} />
              Add
            </button>
          </div>
        </div>

        {/* Todos List */}
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '1rem', border: '1px solid rgba(187, 247, 208, 0.5)', overflow: 'hidden' }}>
          {!todos ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#16a34a' }}>Loading todos...</p>
            </div>
          ) : todos.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <Circle size={48} style={{ color: '#86efac', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'semibold', color: '#166534', marginBottom: '0.5rem' }}>
                No todos yet
              </h3>
              <p style={{ color: '#16a34a' }}>
                Add your first todo above to get started!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {todos.map((todo, index) => (
                <div
                  key={todo._id}
                  style={{
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    borderBottom: index < todos.length - 1 ? '1px solid #f0fdf4' : 'none',
                    opacity: todo.completed ? 0.75 : 1,
                  }}
                >
                  <button
                    onClick={() => handleToggleTodo(todo._id)}
                    style={{
                      flexShrink: 0,
                      width: '1.5rem',
                      height: '1.5rem',
                      borderRadius: '9999px',
                      border: '2px solid #86efac',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: todo.completed ? '#22c55e' : 'transparent',
                      color: todo.completed ? 'white' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <Check size={14} />
                  </button>

                  <span
                    style={{
                      flex: 1,
                      fontSize: '1.125rem',
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      color: todo.completed ? '#6b7280' : '#1f2937',
                    }}
                  >
                    {todo.text}
                  </span>

                  <button
                    onClick={() => handleRemoveTodo(todo._id)}
                    style={{ flexShrink: 0, padding: '0.5rem', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: 'rgba(21, 128, 61, 0.8)', fontSize: '0.875rem' }}>
            Built with Convex • Real-time updates • Always in sync
          </p>
        </div>
      </div>
    </div>
  )
}
