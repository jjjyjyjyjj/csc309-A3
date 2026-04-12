import JobSearchPage from '../../components/common/search/jobSearch';
import './style.css';

function JobList() {
  return (
    <div className="searchPage">
      <h1 className='searchTitle'>Search Jobs</h1>
      <JobSearchPage />
    </div>
  );
}

export default JobList;