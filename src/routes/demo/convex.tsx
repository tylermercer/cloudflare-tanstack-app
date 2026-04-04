import { useCallback, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { Trash2, Plus, Check, Circle } from 'lucide-react'

import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import './convex.module.scss'

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
    <div className="convex-page l-center">
      <div className="convex-container l-stack" style={{ '--space': 'var(--space-l)' } as any}>
        {/* Header Card */}
        <div className="convex-card l-stack" style={{ '--space': 'var(--space-m)' } as any}>
          <div className="l-stack l-center" style={{ '--space': 'var(--space-2xs)' } as any}>
            <h1 className="convex-title">
              Convex Todos
            </h1>
            <p className="convex-subtitle">Powered by real-time sync</p>
            {totalCount > 0 && (
              <div className="convex-stats l-cluster" style={{ '--space': 'var(--space-m)' } as any}>
                <span style={{ color: '#15803d' }}>
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
        <div className="convex-card">
          <div className="convex-input-group">
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
              className="convex-input"
            />
            <button
              className="convex-add-button"
              onClick={handleAddTodo}
              disabled={!newTodo.trim()}
            >
              <Plus size={20} />
              Add
            </button>
          </div>
        </div>

        {/* Todos List */}
        <div className="todo-list">
          {!todos ? (
            <div className="l-center" style={{ padding: '2rem' }}>
              <p style={{ color: '#16a34a' }}>Loading todos...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="l-stack l-center" style={{ padding: '3rem', '--space': 'var(--space-s)' } as any}>
              <Circle size={48} style={{ color: '#86efac' }} />
              <div className="l-stack l-center" style={{ '--space': 'var(--space-3xs)' } as any}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'semibold', color: '#166534' }}>
                  No todos yet
                </h3>
                <p style={{ color: '#16a34a' }}>
                  Add your first todo above to get started!
                </p>
              </div>
            </div>
          ) : (
            <div className="l-stack" style={{ '--space': '0' } as any}>
              {todos.map((todo) => (
                <div
                  key={todo._id}
                  className={`todo-item ${todo.completed ? 'is-completed' : ''}`}
                >
                  <button
                    onClick={() => handleToggleTodo(todo._id)}
                    className={`todo-checkbox ${todo.completed ? 'is-checked' : ''}`}
                  >
                    <Check size={14} />
                  </button>

                  <span className={`todo-text ${todo.completed ? 'is-completed' : ''}`}>
                    {todo.text}
                  </span>

                  <button
                    onClick={() => handleRemoveTodo(todo._id)}
                    className="todo-delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="convex-footer">
          <p>
            Built with Convex • Real-time updates • Always in sync
          </p>
        </div>
      </div>
    </div>
  )
}
