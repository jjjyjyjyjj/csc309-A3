import PositionTypeSearchPage from "../../components/common/search/positionTypeSearch";
import "./style.css";

export default function PositionList() {
    return(
        <>
        <div className="searchPage">
        <h1 className='searchTitle'>Search Position Types</h1>
        <div className="searchPage">
            <PositionTypeSearchPage />
        </div>
        </div>
        </>
    )
}