import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

export function ManageList({ type, items, onClose, onSave }) {
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const label = type === 'categories' ? 'Category' : 'Account';
  
  const save = async next => {
    setError('');
    try {
      await onSave(next);
      return true;
    } catch (saveError) {
      setError(`Could not save ${label.toLowerCase()}: ${saveError.message}`);
      return false;
    }
  };

  const add = async () => { 
    const value = draft.trim(); 
    if (value && !items.includes(value)) { 
      if (await save([...items, value])) setDraft('');
    } 
  };
  
  const update = async (index, value) => { 
    const next = [...items]; 
    next[index] = value.trim() || next[index]; 
    if (await save(next)) setEditing(null); 
  };

  return (
    <div className="overlay" onMouseDown={onClose}>
      <section className="manage-modal" onMouseDown={e => e.stopPropagation()}>
        <button className="close" onClick={onClose}><X size={19}/></button>
        <h2>Manage {type}</h2>
        <p>Add, rename, or remove the choices used in transactions.</p>
        <div className="add-list-item">
          <input 
            value={draft} 
            onChange={e => setDraft(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && add()} 
            placeholder={`New ${label.toLowerCase()}`}
          />
          <button onClick={add}><Plus size={16}/>Add</button>
        </div>
        {error && <p className="manage-error" role="alert">{error}</p>}
        <div className="manage-items">
          {items.map((item, index) => (
            <div key={`${item}-${index}`}>
              {editing === index ? (
                <input 
                  autoFocus 
                  defaultValue={item} 
                  onBlur={e => update(index, e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && update(index, e.currentTarget.value)}
                />
              ) : (
                <span>{item}</span>
              )}
              <button title={`Rename ${label.toLowerCase()}`} onClick={() => setEditing(index)}><Pencil size={15}/></button>
              <button 
                title={`Remove ${label.toLowerCase()}`} 
                className="delete" 
                onClick={() => save(items.filter((_, i) => i !== index))} 
                disabled={items.length === 1}
              >
                <Trash2 size={15}/></button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
