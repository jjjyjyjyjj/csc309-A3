import BusinessSearchPage from '../../components/common/search/businessSearch';
import './style.css';

function BusinessList() {
  return (
    <>
      <div className="searchPage">
        <h1
          className="searchTitle"
          style={{ fontSize: '36px', paddingTop: '24px' }}
        >
          Search Businesses
        </h1>
        <BusinessSearchPage />
      </div>
    </>
  );
}

export default BusinessList;