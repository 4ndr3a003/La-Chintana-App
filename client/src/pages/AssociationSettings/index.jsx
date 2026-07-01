import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Shield, Users, GraduationCap, Layout, CalendarDays, Eye, Palette,
  Plus, Trash2, X, ChevronDown, ChevronUp, Check, Pencil, ToggleLeft, ToggleRight,
  FileText, Globe, ImageIcon, AlertCircle
} from 'lucide-react';
import { useAssociationSettings } from './AssociationSettingsLogic';

// --- Color Presets for Event Types ---
const EVENT_COLOR_PRESETS = [
  { label: 'Giallo', value: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800', preview: '#eab308' },
  { label: 'Blu', value: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800', preview: '#3b82f6' },
  { label: 'Rosso', value: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800', preview: '#ef4444' },
  { label: 'Verde', value: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', preview: '#10b981' },
  { label: 'Grigio', value: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700', preview: '#64748b' },
  { label: 'Viola', value: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800', preview: '#a855f7' },
  { label: 'Arancione', value: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800', preview: '#f97316' },
  { label: 'Ciano', value: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800', preview: '#06b6d4' },
];

const TABS = [
  { id: 'roles', label: 'Ruoli & Struttura', icon: Users, shortLabel: 'Ruoli' },
  { id: 'specs', label: 'Corsi & Specializzazioni', icon: GraduationCap, shortLabel: 'Corsi' },
  { id: 'navigation', label: 'Pagine & Navigazione', icon: Layout, shortLabel: 'Pagine' },
  { id: 'event_types', label: 'Tipologie Evento', icon: CalendarDays, shortLabel: 'Eventi' },
  { id: 'event_visibility', label: 'Visibilità Evento', icon: Eye, shortLabel: 'Visibilità' },
  { id: 'branding', label: 'Personalizzazione', icon: Palette, shortLabel: 'Branding' },
];

// ─── Inline Editable Text ────────────────────────────────────────────
const InlineEdit = ({ value, onSave, placeholder = 'Modifica...' }) => {
  return (
    <div className="flex items-center gap-2 group flex-1 max-w-[280px]">
      <input
        value={value}
        onChange={e => onSave(e.target.value)}
        className="bg-transparent font-bold text-slate-700 dark:text-slate-200 border-b-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 outline-none px-1 py-1 w-full transition-colors text-sm"
        placeholder={placeholder}
      />
      <Pencil size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pointer-events-none" />
    </div>
  );
};

// ─── Add Item Input ──────────────────────────────────────────────────
const AddItemInput = ({ onAdd, placeholder, buttonLabel = 'Aggiungi' }) => {
  const [value, setValue] = useState('');
  const handleAdd = () => { if (value.trim()) { onAdd(value.trim()); setValue(''); } };
  return (
    <div className="flex gap-2 items-center w-full">
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
        placeholder={placeholder}
        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
      />
      <button
        onClick={handleAdd}
        className="flex items-center gap-2 bg-slate-800 dark:bg-slate-100 hover:bg-slate-900 dark:hover:bg-white text-white dark:text-slate-900 text-sm font-bold px-5 py-3 rounded-2xl transition-all active:scale-95 shadow-md whitespace-nowrap"
      >
        <Plus size={18} strokeWidth={2.5} />
        <span className="hidden sm:inline">{buttonLabel}</span>
      </button>
    </div>
  );
};

// ─── Collapsible Section ──────────────────────────────────────────────
const CollapsibleSection = ({ title, children, defaultOpen = true, badge, icon: Icon }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-md transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Icon size={20} strokeWidth={2.5} />
            </div>
          )}
          <h4 className="font-bold text-slate-800 dark:text-white text-base">{title}</h4>
          {badge && <span className="text-[11px] font-extrabold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full uppercase tracking-wider">{badge}</span>}
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${open ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
          {open ? <ChevronUp size={18} strokeWidth={2.5} /> : <ChevronDown size={18} strokeWidth={2.5} />}
        </div>
      </button>
      <div className={open ? 'block pb-6 px-6' : 'hidden'}>
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">{children}</div>
      </div>
    </div>
  );
};

// ─── Save Button ──────────────────────────────────────────────────────
const SaveButton = ({ onClick, saving }) => (
  <div className="pt-6 flex justify-end">
    <button
      onClick={onClick}
      disabled={saving}
      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-900 text-white font-extrabold px-8 py-4 rounded-2xl transition-all shadow-[0_8px_20px_rgb(37,99,235,0.25)] hover:shadow-[0_12px_25px_rgb(37,99,235,0.35)] active:scale-95 w-full sm:w-auto text-base"
    >
      {saving ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <Save size={20} strokeWidth={2.5} />
      )}
      {saving ? 'Salvataggio in corso...' : 'Salva Modifiche'}
    </button>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// TAB PANELS
// ═══════════════════════════════════════════════════════════════════════

// ─── 1. ROLES TAB ────────────────────────────────────────────────────
const RolesTab = ({ roles, addBoardRole, removeBoardRole, updateBoardRoleLabel, addVolunteerRole, removeVolunteerRole, updateVolunteerRoleLabel, onSave, saving }) => {
  if (!roles) return null;
  return (
    <div className="space-y-6">
      <CollapsibleSection title="Ruoli Direttivo" icon={Shield} badge={`${roles.boardRoles?.length || 0} ruoli`}>
        <div className="space-y-3 mb-5">
          {roles.boardRoles?.map(role => (
            <div key={role.key} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl group border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all">
              <InlineEdit value={role.label} onSave={(v) => updateBoardRoleLabel(role.key, v)} />
              <button onClick={() => removeBoardRole(role.key)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
        <AddItemInput onAdd={addBoardRole} placeholder="Es: Vicepresidente, Segretario..." />
      </CollapsibleSection>

      <CollapsibleSection title="Ruoli Volontario (Specializzazione)" icon={Users} badge={`${roles.volunteerRoles?.length || 0} ruoli`}>
        <div className="space-y-3 mb-5">
          {roles.volunteerRoles?.map(role => (
            <div key={role.key} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl group border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all">
              <InlineEdit value={role.label} onSave={(v) => updateVolunteerRoleLabel(role.key, v)} />
              <button onClick={() => removeVolunteerRole(role.key)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
        <AddItemInput onAdd={addVolunteerRole} placeholder="Es: Autista, Medico, Logista..." />
      </CollapsibleSection>

      <CollapsibleSection title="Ruoli Base (Sistema)" icon={AlertCircle} defaultOpen={false}>
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 mb-4">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-400 flex items-start gap-2">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            I ruoli base (Presidente, Direttivo, Volontario) sono predefiniti dal sistema. Gestiscono i permessi chiave e non possono essere rimossi.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roles.baseRoles?.map(role => (
            <div key={role.key} className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                <Shield size={18} />
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">{role.label}</span>
              <span className="text-[10px] font-mono text-slate-400 ml-auto bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{role.value}</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <SaveButton onClick={onSave} saving={saving} />
    </div>
  );
};

// ─── 2. SPECIALIZATIONS TAB ──────────────────────────────────────────
const SpecializationsTab = ({ specializations, addSpecCategory, removeSpecCategory, addSpecItem, removeSpecItem, updateSpecValidity, updateSpecCategoryName, onSave, saving }) => {
  if (!specializations) return null;

  return (
    <div className="space-y-6">
      {specializations.categories?.map((cat, idx) => (
        <CollapsibleSection key={cat.name} title={cat.name} badge={`${cat.items.length} corsi`} icon={GraduationCap}>
          <div className="space-y-4">
            {/* Category name edit */}
            <div className="flex items-center justify-between bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center gap-3 w-full">
                <span className="text-xs font-black text-blue-500 uppercase tracking-wider pl-2">Categoria:</span>
                <InlineEdit value={cat.name} onSave={(v) => updateSpecCategoryName(cat.name, v)} />
              </div>
              <button
                onClick={() => removeSpecCategory(cat.name)}
                className="shrink-0 text-red-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                title="Rimuovi categoria"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="space-y-3">
              {cat.items.map(item => (
                <div key={item} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl group border border-slate-100 dark:border-slate-700">
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-sm flex-1">{item}</span>
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 border-t border-slate-200 dark:border-slate-700 sm:border-t-0 pt-3 sm:pt-0">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Validità (Anni):</label>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={cat.validityYears?.[item] || 0}
                        onChange={e => updateSpecValidity(cat.name, item, e.target.value)}
                        className="w-16 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm font-bold text-center outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <button onClick={() => removeSpecItem(cat.name, item)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm sm:shadow-none sm:bg-transparent">
                      <X size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add item to category */}
            <div className="pt-2">
              <AddItemInput onAdd={(v) => addSpecItem(cat.name, v)} placeholder="Nuovo corso in questa categoria..." buttonLabel="Aggiungi corso" />
            </div>
          </div>
        </CollapsibleSection>
      ))}

      {/* Add new category */}
      <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[2rem] p-6 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center text-blue-500 mb-4">
          <GraduationCap size={24} />
        </div>
        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Nuova Categoria Corsi</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md">Raggruppa i corsi per dipartimento o tipologia per una migliore organizzazione.</p>
        <AddItemInput onAdd={addSpecCategory} placeholder="Nome della nuova categoria..." buttonLabel="Crea Categoria" />
      </div>

      <SaveButton onClick={onSave} saving={saving} />
    </div>
  );
};

// ─── 3. NAVIGATION TAB ──────────────────────────────────────────────
const NavigationTab = ({ navigation, togglePage, addCustomPage, removeCustomPage, updateCustomPageLabel, onSave, saving }) => {
  if (!navigation) return null;

  const systemPages = navigation.pages?.filter(p => p.system) || [];
  const customPages = navigation.pages?.filter(p => !p.system) || [];

  return (
    <div className="space-y-6">
      <CollapsibleSection title="Pagine di Sistema" icon={Layout} badge={`${systemPages.length} pagine`}>
        <div className="space-y-3 mb-6">
          {systemPages.map(page => (
            <div key={page.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 group transition-all hover:border-blue-200 dark:hover:border-blue-800">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${page.enabled ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                  <Layout size={18} />
                </div>
                <div>
                  <span className={`block font-bold ${page.enabled ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400 line-through'}`}>{page.label}</span>
                  <span className="text-xs text-slate-400 font-medium">{page.enabled ? 'Visibile a tutti' : 'Nascosta'}</span>
                </div>
              </div>
              <button onClick={() => togglePage(page.id)} className="transition-all hover:scale-105 active:scale-95">
                {page.enabled ? (
                  <ToggleRight size={36} strokeWidth={1.5} className="text-emerald-500" />
                ) : (
                  <ToggleLeft size={36} strokeWidth={1.5} className="text-slate-400" />
                )}
              </button>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Pagine Aggiuntive" icon={FileText} badge={`${customPages.length} pagine`} defaultOpen={customPages.length > 0}>
        <div className="space-y-3 mb-6">
          {customPages.map(page => (
            <div key={page.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 group transition-all hover:border-purple-200 dark:hover:border-purple-800">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${page.enabled ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                  <FileText size={18} />
                </div>
                <InlineEdit 
                  value={page.label} 
                  onSave={(newVal) => updateCustomPageLabel(page.id, newVal)} 
                  placeholder="Nome pagina..." 
                />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => togglePage(page.id)} className="transition-all hover:scale-105 active:scale-95">
                  {page.enabled ? (
                    <ToggleRight size={36} strokeWidth={1.5} className="text-emerald-500" />
                  ) : (
                    <ToggleLeft size={36} strokeWidth={1.5} className="text-slate-400" />
                  )}
                </button>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <button onClick={() => removeCustomPage(page.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {customPages.length === 0 && (
            <div className="text-center py-8 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <FileText size={24} className="mx-auto mb-2 opacity-50" />
              <p className="font-medium text-sm">Nessuna pagina aggiuntiva creata.</p>
            </div>
          )}
        </div>
        <AddItemInput onAdd={addCustomPage} placeholder="Titolo della nuova pagina..." buttonLabel="Crea Pagina" />
      </CollapsibleSection>

      <SaveButton onClick={onSave} saving={saving} />
    </div>
  );
};

// ─── 4. EVENT TYPES TAB ──────────────────────────────────────────────
const EventTypesTab = ({ eventTypes, addEventType, removeEventType, updateEventTypeColor, updateEventTypeName, onSave, saving }) => {
  if (!eventTypes) return null;

  return (
    <div className="space-y-6">
      <CollapsibleSection title="Tipologie Evento" icon={CalendarDays} badge={`${eventTypes.types?.length || 0} tipi`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {eventTypes.types?.map(type => (
            <div key={type.name} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                <InlineEdit value={type.label} onSave={(v) => updateEventTypeName(type.name, v)} />
                <button onClick={() => removeEventType(type.name)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30">
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Colore Etichetta</span>
                <div className="flex flex-wrap gap-2.5">
                  {EVENT_COLOR_PRESETS.map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => updateEventTypeColor(type.name, preset.value)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${type.color === preset.value ? 'scale-110 shadow-md ring-4 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-blue-400/50' : 'hover:scale-110'}`}
                      style={{ backgroundColor: preset.preview }}
                      title={preset.label}
                    >
                      {type.color === preset.value && <Check size={16} className="text-white drop-shadow-md" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 -mx-5 -mb-5 p-5 rounded-b-[2rem] flex items-center gap-3">
                <span className="text-xs font-medium text-slate-400">Anteprima:</span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${type.color}`}>
                  {type.label}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-700">
           <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3">Nuova Tipologia</h4>
           <AddItemInput onAdd={addEventType} placeholder="Es: Emergenza, Formazione, Riunione..." buttonLabel="Aggiungi" />
        </div>
      </CollapsibleSection>

      <SaveButton onClick={onSave} saving={saving} />
    </div>
  );
};

// ─── 5. EVENT VISIBILITY TAB ─────────────────────────────────────────
const EventVisibilityTab = ({ eventVisibility, roles, specializations, addVisibilityOption, removeVisibilityOption, updateVisibilityLabel, toggleVisibilityRole, onSave, saving }) => {
  if (!eventVisibility) return null;

  return (
    <div className="space-y-6">
      <CollapsibleSection title="Opzioni Visibilità" icon={Eye} badge={`${eventVisibility.options?.length || 0} opzioni`}>
        <div className="space-y-3 mb-5">
          {eventVisibility.options?.map(opt => {
            const allowed = opt.allowedRoles || [];
            return (
              <div key={opt.key} className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm group">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                      <Eye size={18} />
                    </div>
                    <InlineEdit value={opt.label} onSave={(v) => updateVisibilityLabel(opt.key, v)} />
                  </div>
                  <button onClick={() => removeVisibilityOption(opt.key)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30">
                    <Trash2 size={18} />
                  </button>
                </div>
                
                {/* Role Selection */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Destinatari (Chi può vedere)</h4>
                  
                  <div className="space-y-4">
                    {/* Gruppo: Ruoli Base */}
                    <details className="group" open>
                      <summary className="text-[10px] font-bold text-slate-400 uppercase mb-2 cursor-pointer list-none flex items-center gap-2">
                        Ruoli Base
                        <span className="transition-transform group-open:-rotate-180 opacity-50 text-[8px]">▼</span>
                      </summary>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          onClick={() => toggleVisibilityRole(opt.key, 'BASE_ALL')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${allowed.includes('BASE_ALL') ? 'bg-indigo-500 text-white border-indigo-500 shadow-md' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}
                        >
                          Tutti (Pubblico)
                        </button>
                        <button
                          onClick={() => toggleVisibilityRole(opt.key, 'BASE_BOARD')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${allowed.includes('BASE_BOARD') ? 'bg-purple-500 text-white border-purple-500 shadow-md' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-purple-300'}`}
                        >
                          Tutto il Direttivo
                        </button>
                        <button
                          onClick={() => toggleVisibilityRole(opt.key, 'BASE_VOLUNTEER')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${allowed.includes('BASE_VOLUNTEER') ? 'bg-blue-500 text-white border-blue-500 shadow-md' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}
                        >
                          Tutti i Volontari
                        </button>
                      </div>
                    </details>

                    {/* Gruppo: Ruoli Direttivo & Volontari */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      {roles?.boardRoles?.length > 0 && (
                        <details className="flex-1 group">
                          <summary className="text-[10px] font-bold text-slate-400 uppercase mb-2 cursor-pointer list-none flex items-center gap-2">
                            Ruoli Direttivo
                            <span className="transition-transform group-open:-rotate-180 opacity-50 text-[8px]">▼</span>
                          </summary>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {roles.boardRoles.map(r => {
                              const rId = `BOARD_${r.key}`;
                              return (
                                <button
                                  key={rId}
                                  onClick={() => toggleVisibilityRole(opt.key, rId)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${allowed.includes(rId) ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:border-purple-200'}`}
                                >
                                  {r.label}
                                </button>
                              );
                            })}
                          </div>
                        </details>
                      )}
                      
                      {roles?.volunteerRoles?.length > 0 && (
                        <details className="flex-1 group">
                          <summary className="text-[10px] font-bold text-slate-400 uppercase mb-2 cursor-pointer list-none flex items-center gap-2">
                            Ruoli Speciali
                            <span className="transition-transform group-open:-rotate-180 opacity-50 text-[8px]">▼</span>
                          </summary>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {roles.volunteerRoles.map(r => {
                              const rId = `VOLUNTEER_${r.key}`;
                              return (
                                <button
                                  key={rId}
                                  onClick={() => toggleVisibilityRole(opt.key, rId)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${allowed.includes(rId) ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:border-blue-200'}`}
                                >
                                  {r.label}
                                </button>
                              );
                            })}
                          </div>
                        </details>
                      )}
                    </div>

                    {/* Gruppo: Specializzazioni/Corsi divisi per Categoria */}
                    {specializations?.categories?.length > 0 && (
                      <details className="pt-2 group">
                        <summary className="text-[10px] font-bold text-slate-400 uppercase mb-2 cursor-pointer list-none flex items-center gap-2">
                          Corsi e Specializzazioni
                          <span className="transition-transform group-open:-rotate-180 opacity-50 text-[8px]">▼</span>
                        </summary>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 space-y-4 mt-2">
                          {specializations.categories.map((category, idx) => (
                            <div key={idx}>
                              <h6 className="text-[10px] font-semibold text-emerald-600/70 dark:text-emerald-400/70 mb-2">{category.name}</h6>
                              <div className="flex flex-wrap gap-2">
                                {category.items?.map(spec => {
                                  const sId = `SPEC_${spec}`;
                                  return (
                                    <button
                                      key={sId}
                                      onClick={() => toggleVisibilityRole(opt.key, sId)}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${allowed.includes(sId) ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:border-emerald-200'}`}
                                    >
                                      {spec}
                                    </button>
                                  );
                                })}
                                {(!category.items || category.items.length === 0) && (
                                  <span className="text-xs text-slate-400 italic">Nessun corso</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <AddItemInput onAdd={addVisibilityOption} placeholder="Nuova opzione visibilità (es. Solo Specializzati)..." buttonLabel="Aggiungi" />
      </CollapsibleSection>

      <SaveButton onClick={onSave} saving={saving} />
    </div>
  );
};

// ─── 6. BRANDING TAB ────────────────────────────────────────────────
const BrandingTab = ({ branding, setBranding, onSave, saving }) => {
  if (!branding) return null;
  const logoInputRef = useRef(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(branding.logoUrl);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const update = (field, value) => {
    setBranding(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <CollapsibleSection title="Identità Associazione" icon={Globe}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Nome Associazione</label>
            <input value={branding.name} onChange={e => update('name', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 font-bold text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Città</label>
            <input value={branding.city} onChange={e => update('city', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 font-bold text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Descrizione / Note</label>
            <textarea value={branding.description} onChange={e => update('description', e.target.value)} rows={3}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 font-medium text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none" />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Logo Associazione" icon={ImageIcon}>
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
          <div
            onClick={() => logoInputRef.current?.click()}
            className="w-32 h-32 shrink-0 rounded-3xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all overflow-hidden relative group"
          >
            {logoPreview ? (
              <>
                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-2" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Pencil className="text-white" size={24} />
                </div>
              </>
            ) : (
              <div className="text-slate-400 flex flex-col items-center gap-2 group-hover:text-blue-500 transition-colors">
                <ImageIcon size={32} />
                <span className="text-xs font-bold">Carica Logo</span>
              </div>
            )}
            <input
              type="file"
              ref={logoInputRef}
              onChange={handleLogoChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Immagine Profilo Associazione</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-md">Consigliato un formato quadrato (PNG o JPG) con sfondo trasparente. Verrà mostrato nell'header e nelle schede dell'app.</p>
            <button
              onClick={() => logoInputRef.current?.click()}
              className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
            >
              Scegli File
            </button>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Tema e Colori (Design System)" icon={Palette}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Primary Color */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
            <label className="flex items-center gap-3 font-black text-slate-800 dark:text-white mb-2">
               <div className="w-4 h-4 rounded-full bg-blue-600"></div>
               Colore Principale
            </label>
            <p className="text-xs font-medium text-slate-500 mb-5">Usato per l'header, bottoni principali e link.</p>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="color"
                  value={branding.primaryColor || '#002e5c'}
                  onChange={e => update('primaryColor', e.target.value)}
                  className="w-16 h-16 rounded-2xl cursor-pointer opacity-0 absolute inset-0 z-10"
                />
                <div 
                  className="w-16 h-16 rounded-2xl shadow-inner border-4 border-white dark:border-slate-700" 
                  style={{ backgroundColor: branding.primaryColor || '#002e5c' }}
                />
              </div>
              <div className="flex-1">
                <input 
                  type="text" 
                  value={branding.primaryColor || '#002e5c'}
                  onChange={e => update('primaryColor', e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-mono text-sm font-bold outline-none uppercase"
                />
              </div>
            </div>
          </div>
          
          {/* Secondary Color */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
            <label className="flex items-center gap-3 font-black text-slate-800 dark:text-white mb-2">
               <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
               Colore Secondario (Accento)
            </label>
            <p className="text-xs font-medium text-slate-500 mb-5">Usato per badge, notifiche e dettagli in evidenza.</p>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="color"
                  value={branding.secondaryColor || '#ffde03'}
                  onChange={e => update('secondaryColor', e.target.value)}
                  className="w-16 h-16 rounded-2xl cursor-pointer opacity-0 absolute inset-0 z-10"
                />
                <div 
                  className="w-16 h-16 rounded-2xl shadow-inner border-4 border-white dark:border-slate-700" 
                  style={{ backgroundColor: branding.secondaryColor || '#ffde03' }}
                />
              </div>
              <div className="flex-1">
                <input 
                  type="text" 
                  value={branding.secondaryColor || '#ffde03'}
                  onChange={e => update('secondaryColor', e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-mono text-sm font-bold outline-none uppercase"
                />
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <SaveButton 
        onClick={() => {
          console.log("Saving branding with logoFile:", logoFile);
          onSave(logoFile);
        }} 
        saving={saving} 
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

const AssociationSettings = ({ userProfile }) => {
  const { assocId } = useParams();
  const navigate = useNavigate();
  const {
    loading, saving, saveMessage,
    roles, addBoardRole, removeBoardRole, updateBoardRoleLabel, addVolunteerRole, removeVolunteerRole, updateVolunteerRoleLabel, saveRoles,
    specializations, addSpecCategory, removeSpecCategory, addSpecItem, removeSpecItem, updateSpecValidity, updateSpecCategoryName, saveSpecializations,
    navigation, togglePage, addCustomPage, removeCustomPage, updateCustomPageLabel, saveNavigation,
    eventTypes, addEventType, removeEventType, updateEventTypeColor, updateEventTypeName, saveEventTypes,
    eventVisibility, addVisibilityOption, removeVisibilityOption, updateVisibilityLabel, toggleVisibilityRole, saveEventVisibility,
    branding, setBranding, saveBranding
  } = useAssociationSettings(assocId);

  const [activeTab, setActiveTab] = useState('roles');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin shadow-lg" />
          <p className="text-slate-500 font-bold animate-pulse">Caricamento impostazioni...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-24 relative">
      {/* Premium Glass Header */}
      <div className="pt-6 px-4 max-w-5xl mx-auto relative z-10">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-md px-6 py-5 sm:px-8 sm:py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-5">
              <button
                onClick={() => navigate(-1)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md hover:-translate-x-1"
              >
                <ArrowLeft size={22} />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-inner">
                    <Shield className="text-white drop-shadow-md" size={24} />
                  </div>
                  Gestione Associazione
                </h1>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                  ID: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{assocId}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Segmented Control Tabs */}
          <div className="mt-8">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {TABS.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 ${isActive ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
                  >
                    <tab.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 p-6 sm:p-10 relative overflow-hidden">
          
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

          <div className="relative z-10">
            {/* Header of active tab */}
            <div className="mb-8 pb-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
              {(() => {
                const activeData = TABS.find(t => t.id === activeTab);
                if (!activeData) return null;
                const Icon = activeData.icon;
                return (
                  <>
                    <div className="p-3.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                       <Icon size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 dark:text-white">{activeData.label}</h2>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Modifica le configurazioni globali per questo modulo.</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Tab Contents */}
            {activeTab === 'roles' && <RolesTab roles={roles} addBoardRole={addBoardRole} removeBoardRole={removeBoardRole} updateBoardRoleLabel={updateBoardRoleLabel} addVolunteerRole={addVolunteerRole} removeVolunteerRole={removeVolunteerRole} updateVolunteerRoleLabel={updateVolunteerRoleLabel} onSave={saveRoles} saving={saving} />}
            {activeTab === 'specs' && <SpecializationsTab specializations={specializations} addSpecCategory={addSpecCategory} removeSpecCategory={removeSpecCategory} addSpecItem={addSpecItem} removeSpecItem={removeSpecItem} updateSpecValidity={updateSpecValidity} updateSpecCategoryName={updateSpecCategoryName} onSave={saveSpecializations} saving={saving} />}
            {activeTab === 'navigation' && <NavigationTab navigation={navigation} togglePage={togglePage} addCustomPage={addCustomPage} removeCustomPage={removeCustomPage} updateCustomPageLabel={updateCustomPageLabel} onSave={saveNavigation} saving={saving} />}
            {activeTab === 'event_types' && <EventTypesTab eventTypes={eventTypes} addEventType={addEventType} removeEventType={removeEventType} updateEventTypeColor={updateEventTypeColor} updateEventTypeName={updateEventTypeName} onSave={saveEventTypes} saving={saving} />}
            {activeTab === 'event_visibility' && <EventVisibilityTab eventVisibility={eventVisibility} roles={roles} specializations={specializations} addVisibilityOption={addVisibilityOption} removeVisibilityOption={removeVisibilityOption} updateVisibilityLabel={updateVisibilityLabel} toggleVisibilityRole={toggleVisibilityRole} onSave={saveEventVisibility} saving={saving} />}
            {activeTab === 'branding' && <BrandingTab branding={branding} setBranding={setBranding} onSave={saveBranding} saving={saving} />}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {saveMessage && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl font-bold text-white ${saveMessage.type === 'error' ? 'bg-red-500 shadow-red-500/25' : 'bg-emerald-500 shadow-emerald-500/25'}`}>
            {saveMessage.type === 'error' ? <AlertCircle size={24} /> : <Check size={24} />}
            <span>{saveMessage.msg}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssociationSettings;
