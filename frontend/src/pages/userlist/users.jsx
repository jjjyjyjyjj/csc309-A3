import UserSearchPage from '../../components/common/search/userSearch';
import "./style.css";
function UserList() {
  return (
    <div className="searchPage">
      <h1 className='searchTitle'>Search Users</h1>
      <UserSearchPage />
    </div>
  );
}

export default UserList;