import React, { useState, useEffect } from 'react';
import { Plus, Minus, Equal, Trash2, ArrowRight, GripVertical, FolderPlus, LayoutGrid, ChevronDown, ChevronRight } from 'lucide-react';

const App = () => {
    const [scenarios, setScenarios] = useState([]);
    const [newScenarioName, setNewScenarioName] = useState('');
    const [draggedItem, setDraggedItem] = useState(null);
    const [expandedScenarios, setExpandedScenarios] = useState({});

    useEffect(() => {
        const savedData = localStorage.getItem('atomic_habits_scenarios');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setScenarios(parsed);
                const initialExpanded = {};
                parsed.forEach(s => initialExpanded[s.id] = true);
                setExpandedScenarios(initialExpanded);
            } catch (e) {
                console.error("無法載入紀錄", e);
            }
        } else {
            const defaultScenario = { id: 'default', title: '我的日常', habits: [] };
            setScenarios([defaultScenario]);
            setExpandedScenarios({ 'default': true });
        }
    }, []);

    useEffect(() => {
        if (scenarios.length > 0) {
            localStorage.setItem('atomic_habits_scenarios', JSON.stringify(scenarios));
        }
    }, [scenarios]);

    const toggleExpand = (sId) => {
        setExpandedScenarios(prev => ({ ...prev, [sId]: !prev[sId] }));
    };

    const addScenario = (e) => {
        e.preventDefault();
        if (!newScenarioName.trim()) return;

        const newId = Date.now().toString();
        const newS = { id: newId, title: newScenarioName, habits: [] };
        setScenarios([...scenarios, newS]);
        setExpandedScenarios(prev => ({ ...prev, [newId]: true }));
        setNewScenarioName('');
    };

    const deleteScenario = (sId) => {
        if (window.confirm('確定要刪除整個情境嗎？這將會刪除其下所有習慣。')) {
            setScenarios(scenarios.filter(s => s.id !== sId));
            const newExpanded = { ...expandedScenarios };
            delete newExpanded[sId];
            setExpandedScenarios(newExpanded);
        }
    };

    const addHabit = (sId, name) => {
        if (!name.trim()) return;
        setScenarios(scenarios.map(s => {
            if (s.id === sId) {
                return { ...s, habits: [...s.habits, { id: Date.now().toString(), name, score: 'neutral', replacement: '' }] };
            }
            return s;
        }));
    };

    const deleteHabit = (sId, hId) => {
        setScenarios(scenarios.map(s => {
            if (s.id === sId) {
                return { ...s, habits: s.habits.filter(h => h.id !== hId) };
            }
            return s;
        }));
    };

    const updateHabit = (sId, hId, updates) => {
        setScenarios(scenarios.map(s => {
            if (s.id === sId) {
                return { ...s, habits: s.habits.map(h => h.id === hId ? { ...h, ...updates } : h) };
            }
            return s;
        }));
    };

    const handleDragStart = (e, sId, index) => {
        setDraggedItem({ sId, index });
        e.dataTransfer.effectAllowed = "move";
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);
    };

    const handleDragOver = (e, sId, index) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.sId !== sId) return;
        if (draggedItem.index === index) return;
        const newScenarios = [...scenarios];
        const scenario = newScenarios.find(s => s.id === sId);
        const items = [...scenario.habits];
        const itemToMove = items.splice(draggedItem.index, 1)[0];
        items.splice(index, 0, itemToMove);
        scenario.habits = items;
        setScenarios(newScenarios);
        setDraggedItem({ sId, index });
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    const totalStats = {
        positive: scenarios.flatMap(s => s.habits).filter(h => h.score === 'positive').length,
        negative: scenarios.flatMap(s => s.habits).filter(h => h.score === 'negative').length,
        neutral: scenarios.flatMap(s => s.habits).filter(h => h.score === 'neutral').length,
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
            <div className="max-w-3xl mx-auto px-4 pt-8 md:pt-12">
                <header className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 text-white rounded-2xl mb-4 shadow-lg shadow-slate-200">
                        <LayoutGrid size={24} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">原子習慣：覺察計分卡</h1>
                    <p className="text-slate-500 text-sm">「定義情境，記錄行為，掌握人生的自動導航。」</p>
                </header>
                <div className="grid grid-cols-3 gap-3 mb-10">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center transition-transform hover:scale-[1.02]">
                        <div className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1">好習慣 (+)</div>
                        <div className="text-2xl font-black text-slate-800">{totalStats.positive}</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center transition-transform hover:scale-[1.02]">
                        <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">壞習慣 (-)</div>
                        <div className="text-2xl font-black text-slate-800">{totalStats.negative}</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center transition-transform hover:scale-[1.02]">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">中立 (=)</div>
                        <div className="text-2xl font-black text-slate-800">{totalStats.neutral}</div>
                    </div>
                </div>
                <form onSubmit={addScenario} className="mb-12 flex gap-2">
                    <input type="text" value={newScenarioName} onChange={(e) => setNewScenarioName(e.target.value)} placeholder="新增情境分類（例：起床到出門、睡前、上班前）..." className="flex-1 bg-white border-none shadow-md rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-800 transition-all outline-none" />
                    <button type="submit" className="bg-slate-800 text-white px-5 rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2 font-medium shadow-md">
                        <FolderPlus size={18} />
                        <span className="hidden sm:inline">新增</span>
                    </button>
                </form>
                <div className="space-y-6">
                    {scenarios.map((scenario) => {
                        const isExpanded = expandedScenarios[scenario.id];
                        return (
                            <section key={scenario.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div onClick={() => toggleExpand(scenario.id)} className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors select-none">
                                    <div className="flex items-center gap-3">
                                        <div className="text-slate-400">
                                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                        </div>
                                        <div className="w-1 h-5 bg-slate-800 rounded-full" />
                                        <h2 className="text-lg font-bold text-slate-700">{scenario.title}</h2>
                                        <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                            {scenario.habits.length}
                                        </span>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); deleteScenario(scenario.id); }} className="text-slate-300 hover:text-red-400 p-1.5 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                {isExpanded && (
                                    <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="space-y-2 mb-4">
                                            {scenario.habits.length === 0 ? (
                                                <p className="text-center py-4 text-xs text-slate-400 border-2 border-dashed border-slate-50 rounded-xl">目前還沒有習慣，在下方新增一個。</p>
                                            ) : (
                                                scenario.habits.map((habit, index) => (
                                                    <div key={habit.id} draggable onDragStart={(e) => handleDragStart(e, scenario.id, index)} onDragOver={(e) => handleDragOver(e, scenario.id, index)} onDragEnd={handleDragEnd} className={`group relative flex flex-col rounded-xl border transition-all ${draggedItem && draggedItem.index === index && draggedItem.sId === scenario.id ? 'opacity-40 scale-[0.98]' : 'opacity-100'} ${habit.score === 'positive' ? 'bg-green-50/50 border-green-100' : habit.score === 'negative' ? 'bg-red-50/50 border-red-100' : 'bg-white border-slate-50 shadow-sm'}`}> 
                                                        <div className="flex items-center p-3 gap-3">
                                                            <div className="cursor-grab active:cursor-grabbing text-slate-200 hover:text-slate-400">
                                                                <GripVertical size={16} />
                                                            </div>
                                                            <div className="flex-1 flex items-center gap-3">
                                                                <div className={`w-2 h-2 rounded-full ${habit.score === 'positive' ? 'bg-green-500' : habit.score === 'negative' ? 'bg-red-500' : 'bg-slate-300'}`} />
                                                                <span className={`text-sm font-medium ${habit.score === 'neutral' ? 'text-slate-600' : 'text-slate-800'}`}> {habit.name} </span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <button onClick={() => updateHabit(scenario.id, habit.id, { score: 'positive' })} className={`p-1.5 rounded-lg transition-all ${habit.score === 'positive' ? 'bg-green-500 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-100'}`}> 
                                                                    <Plus size={16} />
                                                                </button>
                                                                <button onClick={() => updateHabit(scenario.id, habit.id, { score: 'negative' })} className={`p-1.5 rounded-lg transition-all ${habit.score === 'negative' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-100'}`}> 
                                                                    <Minus size={16} />
                                                                </button>
                                                                <button onClick={() => updateHabit(scenario.id, habit.id, { score: 'neutral' })} className={`p-1.5 rounded-lg transition-all ${habit.score === 'neutral' ? 'bg-slate-200 text-slate-600' : 'text-slate-300 hover:bg-slate-100'}`}> 
                                                                    <Equal size={16} />
                                                                </button>
                                                                <button onClick={() => deleteHabit(scenario.id, habit.id)} className="ml-1 p-1.5 text-slate-200 hover:text-red-300 transition-colors"> 
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {habit.score === 'negative' && (
                                                            <div className="px-10 pb-3 pt-0">
                                                                <div className="bg-white/80 p-2 rounded-lg border border-red-50 flex items-center gap-2">
                                                                    <ArrowRight size={12} className="text-red-400" />
                                                                    <input type="text" value={habit.replacement} onChange={(e) => updateHabit(scenario.id, habit.id, { replacement: e.target.value })} placeholder="建立替代行為（例如：深呼吸三次取代賴床）" className="w-full bg-transparent border-none p-0 text-xs focus:ring-0 placeholder:text-red-200 text-slate-600" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="relative">
                                            <input type="text" onKeyDown={(e) => { if (e.key === 'Enter') { addHabit(scenario.id, e.target.value); e.target.value = ''; } }} placeholder="+ 在此情境下新增微小習慣（完成後按 Enter）" className="w-full bg-slate-50 rounded-xl py-3 px-4 text-sm text-slate-600 focus:bg-slate-100 outline-none transition-all placeholder:text-slate-400" />
                                        </div>
                                    </div>
                                )}
                            </section>
                        );
                    })}
                </div>
                {scenarios.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-400">目前沒有任何情境分類，請從上方新增。</p>
                    </div>
                )}
                <footer className="mt-20 py-8 border-t border-slate-200">
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">Atomic Habits Awareness Tool</p>
                        <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5"><ChevronDown size={14}/> 點擊標題展開/縮小</span>
                            <span className="flex items-center gap-1.5"><GripVertical size={14}/> 拖拉調整順序</span>
                            <span className="flex items-center gap-1.5 font-semibold text-red-400"><ArrowRight size={14}/> 針對負面習慣思考替代方案</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default App;