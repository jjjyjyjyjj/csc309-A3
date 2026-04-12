import { useState, useEffect, useRef, startTransition, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import api from '../../../services/api.jsx';
import JobListView from './JobListView.jsx';
import JobDetailView from './JobDetailView.jsx';
import CandidateListView from './CandidateListView.jsx';
import CandidateProfileView from './CandidateProfileView.jsx';
import InterestedUsersView from './InterestedUsersView.jsx';

import './BusinessJobStyle.css';


// const setFilter = (key, value) => {
//   setFilters(prev => ({ ...prev, [key]: value }));
//   setPage(1); // reset to page 1 whenever a filter changes
// };



// ─── Root Component ───────────────────────────────────────────────────────────
// Manages the view stack and renders whichever view is on top.
function BusinessJobs() {
  // The stack is an array of view objects. The last item is the current view.
  // Each view object has a "type" and any data that view needs.
  const [viewStack, setViewStack] = useState([
    { type: 'jobList' }
  ]);

  const currentView = viewStack[viewStack.length - 1];

  const pushView = (view) => setViewStack(prev => [...prev, view]);

  // ── Breadcrumb labels ──
  const breadcrumbLabel = (view) => {
    switch (view.type) {
      case 'jobList':        return 'Jobs';
      case 'jobDetail':      return view.job.positionType.name;
      case 'candidateList':  return 'Candidates';
      case 'candidateProfile': return `${view.candidate.first_name[0]}${view.candidate.lastt_name[0]}`.toUpperCase();
      case 'interestedList': return 'Interested Users';
      default: return '';
    }
  };

  // ── Render the current view ──
  const renderView = () => {
    switch (currentView.type) {

      case 'jobList':
        return (
          <JobListView
            onSelectJob={(job) => pushView({ type: 'jobDetail', job })}
          />
        );

      case 'jobDetail':
        return (
          <JobDetailView
            job={currentView.job}
            onViewCandidates={() => pushView({ type: 'candidateList', job: currentView.job })}
            onViewInterested={() => pushView({ type: 'interestedList', job: currentView.job })}
          />
        );

      case 'candidateList':
        return (
          <CandidateListView
            job={currentView.job}
            onSelectCandidate={(candidate) => pushView({
              type: 'candidateProfile',
              job: currentView.job,
              candidate,
            })}
          />
        );

      case 'candidateProfile':
        return (
          <CandidateProfileView
            job={currentView.job}
            candidate={currentView.candidate}
            onInterestChanged={(updated) => {
              setViewStack(prev => prev.map((v, i) => {
                // update the profile view with new candidate data
                if (i === prev.length - 1) return { ...v, candidate: updated };
                // update the candidate in the list view below it
                if (v.type === 'candidateList') return {
                  ...v,
                  candidates: v.candidates?.map(c => c.id === updated.id ? updated : c)
                };
                return v;
              }));
            }}
          />
        );

      case 'interestedList':
        return (
          <InterestedUsersView job={currentView.job} />
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className='header'>
        <h3 className='searchTitle'>Find Candidates</h3>
      </div>
      
      {/* ── Breadcrumb nav ── */}
      {viewStack.length > 1 && (
        <div className="breadcrumb">
          {viewStack.map((view, i) => (
            <span key={i}>
              {i < viewStack.length - 1 ? (
                // clicking a previous crumb pops back to that point
                <button
                  className="breadcrumbBtn"
                  onClick={() => setViewStack(prev => prev.slice(0, i + 1))}
                >
                  {breadcrumbLabel(view)}
                </button>
              ) : (
                // current view is just text, not clickable
                <span className="breadcrumbCurrent">{breadcrumbLabel(view)}</span>
              )}
              {i < viewStack.length - 1 && <span className="separator"> › </span>}
            </span>
          ))}
        </div>
      )}

      {/* ── Current View ── */}
      {renderView()}
    </div>
  );
}



export default BusinessJobs;