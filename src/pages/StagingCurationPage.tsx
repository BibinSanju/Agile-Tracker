import React, { useState, useEffect } from 'react';
import { 
  Inbox,
  CheckSquare, 
  Square, 
  Download, 
  CheckCircle2, 
  Eye, 
  Filter, 
  Layers, 
  Cpu, 
  AlertCircle, 
  FileCode, 
  Check, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Plus,
  Loader2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SAMPLE_STAGED_QUESTIONS, StagedQuestion } from '../data/sampleStagedQuestions';
import PlaneSidebar from '../components/PlaneSidebar';
import PlaneHeader from '../components/PlaneHeader';
import { SEED_ARCHITECTURE_ISSUES } from '../data/planeData';
import { api } from '../services/api';

function normalizeStagedQuestion(question: StagedQuestion): StagedQuestion {
  const solution = question.referenceSolution as Partial<StagedQuestion['referenceSolution']> | null;
  return {
    ...question,
    submittedAt: typeof question.submittedAt === 'string'
      ? question.submittedAt
      : new Date(question.submittedAt as any).toISOString(),
    referenceSolution: {
      language: typeof solution?.language === 'string' ? solution.language : '',
      code: typeof solution?.code === 'string' ? solution.code : ''
    },
    testCases: Array.isArray(question.testCases) ? question.testCases : []
  };
}

const CATEGORY_OPTIONS = [
  'DSA/Graphs/Breadth First Search (BFS)',
  'DSA/Graphs/Depth First Search (DFS)',
  'DSA/Dynamic Programming/Knapsack',
  'DSA/Dynamic Programming/1D-DP',
  'DSA/Trees/Binary Search Tree',
  'DBMS/SQL/Complex Queries',
  'Operating Systems/Process Scheduling'
];

type ReviewDifficulty = 'Easy' | 'Medium' | 'Hard';

export default function StagingCurationPage() {
  const [questions, setQuestions] = useState<StagedQuestion[]>(SAMPLE_STAGED_QUESTIONS);
  const [liveSource, setLiveSource] = useState<'backend' | 'sample'>('sample');

  // Pull the real staging queue (populated by the nightly scraper) when the
  // backend is reachable; otherwise keep the bundled sample questions.
  useEffect(() => {
    let cancelled = false;
    api.getStagedQuestions().then((rows) => {
      if (cancelled || rows === null) return;
      setQuestions(rows.map(normalizeStagedQuestion));
      setLiveSource('backend');
    });
    return () => { cancelled = true; };
  }, []);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED'>('PENDING');
  const [targetCategory, setTargetCategory] = useState('');
  const [targetDifficulty, setTargetDifficulty] = useState<ReviewDifficulty | ''>('');
  const [inspectQuestion, setInspectQuestion] = useState<StagedQuestion | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [questionTitle, setQuestionTitle] = useState('');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const filteredQuestions = questions.filter(q => {
    if (activeTab === 'PENDING') return q.status === 'PENDING_REVIEW';
    if (activeTab === 'APPROVED') return q.status === 'APPROVED';
    return true;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredQuestions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQuestions.map(q => q.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleTextIngestion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = questionText.trim();
    const title = questionTitle.trim();
    if (!title || !text) {
      setSubmissionError('Enter both a title and description before adding the question.');
      return;
    }

    setIsSubmittingQuestion(true);
    setSubmissionError(null);
    const result = await api.createStagedQuestion({
      text,
      title
    });
    setIsSubmittingQuestion(false);

    if (result.status === 'duplicate') {
      setSubmissionError(
        `Possible duplicate (${Math.round(result.duplicate.similarity * 100)}% match): "${result.duplicate.title}". Nothing was added.`
      );
      return;
    }
    if (result.status === 'error') {
      setSubmissionError(`${result.message} Check the API and database configuration, then try again.`);
      return;
    }

    const normalized = normalizeStagedQuestion(result.question);
    setQuestions(previous => liveSource === 'backend'
      ? [normalized, ...previous.filter(question => question.id !== normalized.id)]
      : [normalized]);
    setLiveSource('backend');
    setActiveTab('PENDING');
    setQuestionText('');
    setQuestionTitle('');
    const modeLabel = result.processing.mode === 'ai' ? 'AI formalized' : 'locally structured';
    setSuccessToast(`Added "${normalized.title}" to the review queue (${modeLabel}, duplicate checked).`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0 || !targetCategory || !targetDifficulty) return;

    setQuestions(prev => prev.map(q => {
      if (selectedIds.includes(q.id)) {
        return {
          ...q,
          status: 'APPROVED',
          confirmedCategory: targetCategory,
          difficulty: targetDifficulty
        };
      }
      return q;
    }));

    // Persist when the queue came from the backend (optimistic; failures are
    // logged by the API client and the local state stays approved).
    if (liveSource === 'backend') {
      selectedIds.forEach((id) => { api.approveStagedQuestion(id, targetCategory, targetDifficulty); });
    }

    setSuccessToast(`Successfully approved ${selectedIds.length} question(s) as ${targetDifficulty} in ${targetCategory}.`);
    setSelectedIds([]);
    setTargetCategory('');
    setTargetDifficulty('');
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const openInspector = (question: StagedQuestion) => {
    setInspectQuestion(question);
    const category = question.confirmedCategory || question.suggestedCategory;
    setTargetCategory(category === 'Unassigned' ? '' : category);
    setTargetDifficulty(question.difficulty === 'Unassigned' ? '' : question.difficulty);
  };

  const handleInspectorApprove = () => {
    if (!inspectQuestion || !targetCategory || !targetDifficulty) return;
    const approvedId = inspectQuestion.id;
    const approvedTitle = inspectQuestion.title;
    setQuestions(previous => previous.map(question => question.id === approvedId
      ? { ...question, status: 'APPROVED', confirmedCategory: targetCategory, difficulty: targetDifficulty }
      : question));
    if (liveSource === 'backend') {
      void api.approveStagedQuestion(approvedId, targetCategory, targetDifficulty);
    }
    setInspectQuestion(null);
    setSuccessToast(`Approved "${approvedTitle}" as ${targetDifficulty} in ${targetCategory}.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleExportMoodleXML = () => {
    const toExport = questions.filter(q => selectedIds.length === 0 || selectedIds.includes(q.id));
    if (toExport.length === 0) {
      alert('No questions to export.');
      return;
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n`;
    const categories = Array.from(new Set(toExport.map(q => q.confirmedCategory || q.suggestedCategory)));

    categories.forEach(cat => {
      xml += `  <!-- Category: ${cat} -->\n`;
      xml += `  <question type="category">\n`;
      xml += `    <category>\n`;
      xml += `      <text>$course$/top/${cat}</text>\n`;
      xml += `    </category>\n`;
      xml += `    <info format="moodle_auto_format">\n`;
      xml += `      <text>Curated by IntelX AI Pipeline</text>\n`;
      xml += `    </info>\n`;
      xml += `  </question>\n\n`;

      const catQuestions = toExport.filter(q => (q.confirmedCategory || q.suggestedCategory) === cat);

      catQuestions.forEach((q) => {
        const cleanTitle = q.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        xml += `  <question type="essay">\n`;
        xml += `    <name>\n`;
        xml += `      <text>${cleanTitle}</text>\n`;
        xml += `    </name>\n`;
        xml += `    <questiontext format="html">\n`;
        xml += `      <text><![CDATA[\n`;
        xml += `        <h3>${q.title}</h3>\n`;
        xml += `        <p>${q.description}</p>\n`;
        xml += `        <h4>Standard I/O Sample Testcases</h4>\n`;
        xml += `        <pre>Input:\n${q.testCases[0]?.input || ''}\n\nExpected Output:\n${q.testCases[0]?.expectedOutput || ''}</pre>\n`;
        xml += `        <p><strong>Difficulty:</strong> ${q.difficulty} | <strong>Time Limit:</strong> ${q.timeLimitSeconds}s | <strong>Memory:</strong> ${q.memoryLimitMb}MB</p>\n`;
        xml += `      ]]></text>\n`;
        xml += `    </questiontext>\n`;
        xml += `    <generalfeedback format="html">\n`;
        xml += `      <text><![CDATA[<p>Optimal Solution (${q.referenceSolution.language.toUpperCase()}):</p><pre>${q.referenceSolution.code}</pre>]]></text>\n`;
        xml += `    </generalfeedback>\n`;
        xml += `    <defaultgrade>10.0000000</defaultgrade>\n`;
        xml += `    <penalty>0.0000000</penalty>\n`;
        xml += `    <hidden>0</hidden>\n`;
        xml += `    <responseformat>editor</responseformat>\n`;
        xml += `  </question>\n\n`;
      });
    });

    xml += `</quiz>`;

    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `moodle_quiz_export_${new Date().toISOString().split('T')[0]}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSuccessToast(`Exported ${toExport.length} question(s) to Moodle XML!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="plane-app">
      <PlaneSidebar 
        issues={SEED_ARCHITECTURE_ISSUES}
        activeView="list"
        setActiveView={() => { window.location.href = '/'; }}
        onOpenNewIssue={() => { window.location.href = '/'; }}
      />

      <div className="plane-main">
        <PlaneHeader 
          currentViewTitle="Faculty Question Staging & Review Queue"
          onExportJSON={handleExportMoodleXML}
        />

        {/* Staging Content */}
        <div className="plane-content-body">
          {/* Toast */}
          {successToast && (
            <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: 'var(--plane-accent-emerald)', color: '#fff', padding: '8px 14px', borderRadius: 'var(--plane-radius-sm)', display: 'flex', alignItems: 'center', gap: '6px', zIndex: 999, fontSize: '12.5px', fontWeight: 600 }}>
              <CheckCircle2 size={16} />
              <span>{successToast}</span>
            </div>
          )}

          <form className="plane-box" onSubmit={handleTextIngestion}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: 650, color: 'var(--plane-text-primary)' }}>
                  <Sparkles size={15} color="var(--plane-accent-blue)" />
                  <span>Add a question from text</span>
                </div>
                <p style={{ margin: '4px 0 0', color: 'var(--plane-text-muted)', fontSize: '11.5px' }}>
                  Submit only the title and description. Faculty assigns difficulty and category during review; duplicate checking always runs before insertion.
                </p>
              </div>
              <span className="module-badge" style={{ whiteSpace: 'nowrap' }}>AI-assisted ingestion</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="question-title" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>TITLE *</label>
              <input
                id="question-title"
                className="plane-select"
                value={questionTitle}
                onChange={event => setQuestionTitle(event.target.value)}
                placeholder="Example: Two Sum"
              />
            </div>

            <label htmlFor="question-text" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>
              DESCRIPTION *
            </label>
            <textarea
              id="question-text"
              value={questionText}
              onChange={event => setQuestionText(event.target.value)}
              placeholder="Describe the problem, expected input, and expected output..."
              rows={5}
              style={{ width: '100%', resize: 'vertical', background: 'var(--plane-bg-base)', border: '1px solid var(--plane-border-subtle)', borderRadius: 'var(--plane-radius-sm)', color: 'var(--plane-text-primary)', padding: '9px 10px', fontFamily: 'inherit', fontSize: '12.5px', lineHeight: 1.5 }}
            />

            {submissionError && (
              <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--plane-accent-red)', fontSize: '11.5px' }}>
                <AlertCircle size={14} />
                <span>{submissionError}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="plane-btn plane-btn-primary" type="submit" disabled={isSubmittingQuestion}>
                {isSubmittingQuestion ? <Loader2 size={13} className="spin" /> : <Plus size={13} />}
                <span>{isSubmittingQuestion ? 'Processing...' : 'Add to review queue'}</span>
              </button>
            </div>
          </form>

          {/* Batch Actions Bar */}
          <div className="plane-box" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button 
                className={`view-mode-btn ${activeTab === 'PENDING' ? 'active' : ''}`}
                onClick={() => setActiveTab('PENDING')}
              >
                <span>Pending Review ({questions.filter(q => q.status === 'PENDING_REVIEW').length})</span>
              </button>
              <button 
                className={`view-mode-btn ${activeTab === 'APPROVED' ? 'active' : ''}`}
                onClick={() => setActiveTab('APPROVED')}
              >
                <span>Approved ({questions.filter(q => q.status === 'APPROVED').length})</span>
              </button>
              <button 
                className={`view-mode-btn ${activeTab === 'ALL' ? 'active' : ''}`}
                onClick={() => setActiveTab('ALL')}
              >
                <span>All ({questions.length})</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select 
                className="plane-select"
                aria-label="Faculty category"
                value={targetCategory}
                onChange={e => setTargetCategory(e.target.value)}
              >
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                className="plane-select"
                aria-label="Faculty difficulty"
                value={targetDifficulty}
                onChange={event => setTargetDifficulty(event.target.value as ReviewDifficulty | '')}
              >
                <option value="">Select difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <button 
                className="plane-btn plane-btn-primary"
                disabled={selectedIds.length === 0 || !targetCategory || !targetDifficulty}
                onClick={handleBulkApprove}
                style={{ opacity: selectedIds.length === 0 || !targetCategory || !targetDifficulty ? 0.5 : 1 }}
              >
                <Check size={13} />
                <span>Approve Selected ({selectedIds.length})</span>
              </button>

              <button className="plane-btn plane-btn-secondary" onClick={handleExportMoodleXML}>
                <Download size={13} />
                <span>Export Moodle XML</span>
              </button>
            </div>
          </div>

          {/* Questions Group */}
          <div className="plane-list-group">
            <div className="list-group-header">
              <div className="list-group-header-left">
                <input 
                  type="checkbox"
                  checked={selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0}
                  onChange={handleSelectAll}
                  style={{ cursor: 'pointer', accentColor: 'var(--plane-accent-blue)' }}
                />
                <span>Staged Questions</span>
                <span className="sidebar-count-badge">{filteredQuestions.length}</span>
              </div>
              <span style={{ fontSize: '11.5px', color: 'var(--plane-text-muted)' }}>
                {selectedIds.length} selected
              </span>
            </div>

            <div>
              {filteredQuestions.map(q => {
                const isSelected = selectedIds.includes(q.id);

                return (
                  <div 
                    key={q.id}
                    className="plane-issue-row"
                    style={{ background: isSelected ? 'rgba(63, 123, 246, 0.08)' : undefined }}
                    onClick={() => handleToggleSelect(q.id)}
                  >
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(q.id)}
                      onClick={e => e.stopPropagation()}
                      style={{ cursor: 'pointer', accentColor: 'var(--plane-accent-blue)' }}
                    />

                    <span className="issue-identifier">{q.id.toUpperCase()}</span>

                    <span className="issue-title-text" style={{ maxWidth: '380px' }}>
                      {q.title}
                    </span>

                    <div className="issue-meta-items" style={{ marginLeft: 'auto' }}>
                      <span className="module-badge">{q.source}</span>
                      <span className="module-badge" style={{ color: 'var(--plane-accent-blue)', fontFamily: 'var(--font-mono)' }}>
                        {(q.confirmedCategory || q.suggestedCategory) === 'Unassigned' ? 'Awaiting category' : q.confirmedCategory || q.suggestedCategory}
                      </span>
                      <span className="module-badge">{q.difficulty === 'Unassigned' ? 'Awaiting difficulty' : q.difficulty}</span>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: 'var(--plane-accent-emerald)', fontWeight: 600 }}>
                        <ShieldCheck size={13} />
                        <span>{q.testPassRate}</span>
                      </div>

                      <span className="points-badge" style={{ color: q.status === 'APPROVED' ? 'var(--plane-accent-emerald)' : 'var(--plane-accent-amber)' }}>
                        {q.status}
                      </span>

                      <button 
                        className="plane-btn plane-btn-secondary"
                        style={{ padding: '2px 6px', fontSize: '11px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openInspector(q);
                        }}
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Inspector Modal */}
      {inspectQuestion && (
        <div className="plane-modal-overlay" onClick={() => setInspectQuestion(null)}>
          <div className="plane-modal" style={{ maxWidth: '720px' }} onClick={e => e.stopPropagation()}>
            <div className="plane-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="issue-identifier">{inspectQuestion.id.toUpperCase()}</span>
                <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--plane-text-primary)' }}>{inspectQuestion.title}</span>
              </div>
              <button onClick={() => setInspectQuestion(null)} style={{ background: 'none', border: 'none', color: 'var(--plane-text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div className="plane-modal-body">
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>PROBLEM STATEMENT</label>
                <div style={{ background: 'var(--plane-bg-base)', padding: '8px 10px', borderRadius: 'var(--plane-radius-sm)', fontSize: '12.5px', color: 'var(--plane-text-secondary)', border: '1px solid var(--plane-border-subtle)', lineHeight: 1.5, marginTop: '3px' }}>
                  {inspectQuestion.description}
                </div>
              </div>

              {inspectQuestion.status !== 'APPROVED' && (
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>FACULTY CLASSIFICATION *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginTop: '3px' }}>
                    <select
                      className="plane-select"
                      aria-label="Review category"
                      value={targetCategory}
                      onChange={event => setTargetCategory(event.target.value)}
                    >
                      <option value="">Select category</option>
                      {CATEGORY_OPTIONS.map(category => <option key={category} value={category}>{category}</option>)}
                    </select>
                    <select
                      className="plane-select"
                      aria-label="Review difficulty"
                      value={targetDifficulty}
                      onChange={event => setTargetDifficulty(event.target.value as ReviewDifficulty | '')}
                    >
                      <option value="">Select difficulty</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>
                  {inspectQuestion.sandboxStatus === 'VERIFIED' ? 'VERIFIED I/O TEST CASES' : 'I/O TEST CASES'}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '140px', overflowY: 'auto', marginTop: '3px' }}>
                  {inspectQuestion.testCases.length === 0 && (
                    <div style={{ background: 'var(--plane-bg-base)', padding: '8px 10px', borderRadius: 'var(--plane-radius-sm)', border: '1px solid var(--plane-border-subtle)', color: 'var(--plane-text-muted)', fontSize: '11.5px' }}>
                      Test cases have not been generated or verified yet.
                    </div>
                  )}
                  {inspectQuestion.testCases.map(tc => (
                    <div key={tc.id} style={{ background: 'var(--plane-bg-base)', padding: '4px 8px', borderRadius: 'var(--plane-radius-xs)', border: '1px solid var(--plane-border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                      <div><strong style={{ color: 'var(--plane-accent-blue)' }}>Input:</strong> {tc.input.replace(/\n/g, ' ')}</div>
                      <div><strong style={{ color: 'var(--plane-accent-emerald)' }}>Expected:</strong> {tc.expectedOutput.replace(/\n/g, ' ')}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>
                  REFERENCE SOLUTION{inspectQuestion.referenceSolution.language ? ` (${inspectQuestion.referenceSolution.language.toUpperCase()})` : ''}
                </label>
                {inspectQuestion.referenceSolution.code ? (
                  <pre style={{ background: 'var(--plane-bg-base)', padding: '8px 10px', borderRadius: 'var(--plane-radius-sm)', fontSize: '11px', fontFamily: 'var(--font-mono)', overflowX: 'auto', border: '1px solid var(--plane-border-subtle)', color: 'var(--plane-text-primary)', marginTop: '3px' }}>
                    {inspectQuestion.referenceSolution.code}
                  </pre>
                ) : (
                  <div style={{ background: 'var(--plane-bg-base)', padding: '8px 10px', borderRadius: 'var(--plane-radius-sm)', border: '1px solid var(--plane-border-subtle)', color: 'var(--plane-text-muted)', fontSize: '11.5px', marginTop: '3px' }}>
                    A reference solution has not been generated yet.
                  </div>
                )}
              </div>
            </div>

            <div className="plane-modal-footer">
              <button className="plane-btn plane-btn-secondary" onClick={() => setInspectQuestion(null)}>Close</button>
              {inspectQuestion.status !== 'APPROVED' && (
                <button 
                  className="plane-btn plane-btn-primary"
                  disabled={!targetCategory || !targetDifficulty}
                  onClick={handleInspectorApprove}
                  style={{ opacity: !targetCategory || !targetDifficulty ? 0.5 : 1 }}
                >
                  <Check size={13} />
                  <span>Approve to Live DB</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
