import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { categoryIconOptions, categoryIconsByName, defaultCategoryIcon } from '../utils/categoryIcons';

export function ManageList({ type, items, categoryIcons = {}, onClose, onSave }) {
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const label = type === 'categories' ? 'Category' : 'Account';
  
  const save = async (next, nextCategoryIcons) => {
    setError('');
    try {
      await onSave(next, nextCategoryIcons);
      return true;
    } catch (saveError) {
      setError(`Could not save ${label.toLowerCase()}: ${saveError.message}`);
      return false;
    }
  };

  const add = async () => { 
    const value = draft.trim(); 
    if (value && !items.includes(value)) { 
      const nextCategoryIcons = type === 'categories'
        ? { ...categoryIcons, [value]: defaultCategoryIcon }
        : undefined;
      if (await save([...items, value], nextCategoryIcons)) setDraft('');
    } 
  };
  
  const update = async (index, value) => { 
    const previousName = items[index];
    const nextName = value.trim() || previousName;
    if (items.includes(nextName) && nextName !== previousName) {
      setEditing(null);
      return;
    }
    const next = [...items]; 
    next[index] = nextName;
    const nextCategoryIcons = { ...categoryIcons };
    if (type === 'categories' && previousName !== nextName) {
      nextCategoryIcons[nextName] = nextCategoryIcons[previousName] || defaultCategoryIcon;
      delete nextCategoryIcons[previousName];
    }
    if (await save(next, type === 'categories' ? nextCategoryIcons : undefined)) setEditing(null); 
  };

  const updateIcon = async (name, iconName) => {
    const nextCategoryIcons = { ...categoryIcons, [name]: iconName };
    await save(items, nextCategoryIcons);
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
              {type === 'categories' && (
                <>
                  {(() => {
                    const Icon = categoryIconsByName[categoryIcons[item]] || categoryIconsByName[defaultCategoryIcon];
                    return <Icon className="category-icon-preview" aria-hidden="true" size={17} />;
                  })()}
                  <select
                    className="category-icon-select"
                    aria-label={`Icon for ${item}`}
                    value={categoryIcons[item] || defaultCategoryIcon}
                    onChange={event => updateIcon(item, event.target.value)}
                  >
                    {categoryIconOptions.map(([iconName, Icon, label]) => (
                      <option key={iconName} value={iconName}>{label}</option>
                    ))}
                  </select>
                </>
              )}
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
                onClick={() => {
                  const nextCategoryIcons = { ...categoryIcons };
                  delete nextCategoryIcons[item];
                  return save(
                    items.filter((_, i) => i !== index),
                    type === 'categories' ? nextCategoryIcons : undefined,
                  );
                }} 
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
