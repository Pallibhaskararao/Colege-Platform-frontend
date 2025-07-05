import React from 'react';
import { Link } from 'react-router-dom';
import './ProfileMini.css';

const ProfileMini = ({ user, onRemove, onAdd }) => {
  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="profile-mini">
      <div className="profile-mini-user">
        <div className="profile-pic-holder profile-pic-holder-mini">
          <img
            src={`http://locahost:5000${user.profilePicture}`} // Retrieve profilePicture from the database
            alt={user.name || 'Unknown'}
            className="profile-pic"
          />
        </div>
        <div className="profile-mini-info">
          <Link to={`/user/${user._id}`} style={{ textDecoration: 'none', color: '#007bff' }}>
            <h4 className="profile-mini-name">{user.name || 'Unknown'}</h4>
          </Link>
          <p className="profile-mini-email">{user.email || 'No email'}</p>
        </div>
      </div>
      {onAdd && (
        <button
          type="button"
          onClick={() => onAdd(user)}
          className="add-button"
        >
          Add
        </button>
      )}
      {onRemove && (
        <button
          type="button"
          className="remove-button"
          onClick={() => onRemove(user._id)}
        >
          Remove
        </button>
      )}
    </div>
  );
};

export default ProfileMini;