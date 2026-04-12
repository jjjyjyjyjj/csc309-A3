import QualificationsSearchPage from "../../components/common/search/qualificationsSearch";

import "./style.css";

export default function QualificationList() {
    return(
        <>
        <div className="searchPage">
        <h1 className='searchTitle'>Search Qualifications</h1>
        <div className="searchPage">
            <QualificationsSearchPage />
        </div>
        </div>
        </>
    )
}