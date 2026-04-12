import { useState, useRef, useEffect } from "react";
import { useAuth } from '../../context/AuthContext';
import "./profileForm.css";
import { jwtDecode } from "jwt-decode";

const getRole = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded.role || null;
  } catch {
    return null;
  }
};

const ProfileForm = (props) => {
  const { onDataChange, onSubmit, submitLabel = "Save", onDiscard } = props;

  const { user: authUser, loading: authLoading } = useAuth();
  const role = getRole(); // "business" | "user" | "admin"
  const isBusiness = role === "business";

  const [formData, setFormData] = useState(
    isBusiness
      ? {
          business_name: "",
          owner_name: "",
          email: "",
          phone_number: "",
          postal_address: "",
          location: { lon: "", lat: "" },
        }
      : {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          postal_address: "",
          bio: "",
          resume: "",
        }
  );

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authUser) return;

    if (isBusiness) {
      setFormData({
        business_name: authUser.business_name || "",
        owner_name: authUser.owner_name || "",
        email: authUser.email || "",
        phone_number: authUser.phone_number || "",
        postal_address: authUser.postal_address || "",
        location: authUser.location || { lon: "", lat: "" },
      });
    } else {
      setFormData({
        firstName: authUser.first_name || "",
        lastName: authUser.last_name || "",
        email: authUser.email || "",
        phone: authUser.phone_number || "",
        postal_address: authUser.postal_address || "",
        bio: authUser.biography || "",
        resume: authUser.resume || "",
      });
    }
  }, [authUser, isBusiness]);

  if (authLoading || !authUser) return <div>Loading profile data...</div>;

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    const val = type === "file" ? files[0] : value;
  
    const newData = { ...formData, [name]: val };
    setFormData(newData);
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    if (onDataChange) onDataChange(newData);
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target; // "lon" or "lat"
    const newData = {
      ...formData,
      location: { ...formData.location, [name]: value },
    };
    setFormData(newData);
    setFieldErrors((prev) => ({ ...prev, location: "" }));
    if (onDataChange) onDataChange(newData);
  };

  const validateBusiness = () => {
    const errors = {};
    if (!formData.business_name?.trim()) errors.business_name = "Business name is required.";
    if (!formData.owner_name?.trim()) errors.owner_name = "Owner name is required.";
    if (!formData.email?.trim()) errors.email = "Email is required.";
    if (!formData.phone_number?.trim()) errors.phone_number = "Phone number is required.";
    if (!formData.postal_address?.trim()) errors.postal_address = "Postal address is required.";
    const lon = parseFloat(formData.location?.lon);
    const lat = parseFloat(formData.location?.lat);
    if (isNaN(lon) || isNaN(lat)) errors.location = "Valid longitude and latitude are required.";
    return errors;
  };

  const validateUser = () => {
    const errors = {};
    if (!formData.firstName?.trim()) errors.firstName = "First name is required.";
    if (!formData.lastName?.trim()) errors.lastName = "Last name is required.";
    if (!formData.email?.trim()) errors.email = "Email is required.";
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = isBusiness ? validateBusiness() : validateUser();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    const payload = isBusiness
      ? {
          ...formData,
          location: {
            lon: parseFloat(formData.location.lon),
            lat: parseFloat(formData.location.lat),
          },
        }
      : formData;

    if (onSubmit) onSubmit(payload);
  };

  if (isBusiness) {
    return (
      <form onSubmit={handleSubmit} className="profileForm" noValidate>
        <div className="profileFormRow">
          <dt><label htmlFor="business_name">Business Name</label></dt>
          <dd>
            <input
              type="text"
              id="business_name"
              name="business_name"
              value={formData.business_name}
              onChange={handleChange}
              placeholder="Your business name"
              maxLength={100}
              required
              className={fieldErrors.business_name ? "inputError" : undefined}
            />
            {fieldErrors.business_name && <span className="errorMessage">{fieldErrors.business_name}</span>}
          </dd>
        </div>

        <div className="profileFormRow">
          <dt><label htmlFor="owner_name">Owner Name</label></dt>
          <dd>
            <input
              type="text"
              id="owner_name"
              name="owner_name"
              value={formData.owner_name}
              onChange={handleChange}
              placeholder="Primary owner's full name"
              maxLength={100}
              required
              className={fieldErrors.owner_name ? "inputError" : undefined}
            />
            {fieldErrors.owner_name && <span className="errorMessage">{fieldErrors.owner_name}</span>}
          </dd>
        </div>

        <div className="profileFormRow">
          <dt><label htmlFor="email">Email</label></dt>
          <dd>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Business email"
              maxLength={150}
              required
              className={fieldErrors.email ? "inputError" : undefined}
            />
            {fieldErrors.email && <span className="errorMessage">{fieldErrors.email}</span>}
          </dd>
        </div>

        <div className="profileFormRow">
          <dt><label htmlFor="phone_number">Phone Number</label></dt>
          <dd>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Business phone number"
              maxLength={15}
              required
              className={fieldErrors.phone_number ? "inputError" : undefined}
            />
            {fieldErrors.phone_number && <span className="errorMessage">{fieldErrors.phone_number}</span>}
          </dd>
        </div>

        <div className="profileFormRow">
          <dt><label htmlFor="postal_address">Postal Address</label></dt>
          <dd>
            <input
              type="text"
              id="postal_address"
              name="postal_address"
              value={formData.postal_address}
              onChange={handleChange}
              placeholder="Business postal address"
              maxLength={100}
              required
              className={fieldErrors.postal_address ? "inputError" : undefined}
            />
            {fieldErrors.postal_address && <span className="errorMessage">{fieldErrors.postal_address}</span>}
          </dd>
        </div>

        <div className="profileFormRow">
          <dt><label>Location</label></dt>
          <dd className="locationFields">
            <input
              type="number"
              id="lon"
              name="lon"
              value={formData.location.lon}
              onChange={handleLocationChange}
              placeholder="Longitude"
              step="any"
              required
              className={fieldErrors.location ? "inputError" : undefined}
            />
            <input
              type="number"
              id="lat"
              name="lat"
              value={formData.location.lat}
              onChange={handleLocationChange}
              placeholder="Latitude"
              step="any"
              required
              className={fieldErrors.location ? "inputError" : undefined}
            />
            {fieldErrors.location && <span className="errorMessage">{fieldErrors.location}</span>}
          </dd>
        </div>

        <div className="buttonContainer">
          <button type="submit" className="profileSubmitButton" disabled={loading}>
            {submitLabel}
          </button>
          {onDiscard && (
            <button type="button" className="profileDiscardButton" onClick={onDiscard} disabled={loading}>
              DISCARD CHANGES
            </button>
          )}
        </div>
      </form>
    );
  }

  // for regular users
  return (
    <form onSubmit={handleSubmit} className="profileForm" noValidate>
      <div className="profileFormRow">
        <dt><label htmlFor="firstName">First Name</label></dt>
        <dd>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Your first name"
            maxLength={30}
            required
            className={fieldErrors.firstName ? "inputError" : undefined}
          />
          {fieldErrors.firstName && <span className="errorMessage">{fieldErrors.firstName}</span>}
        </dd>
      </div>

      <div className="profileFormRow">
        <dt><label htmlFor="lastName">Last Name</label></dt>
        <dd>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Your last name"
            maxLength={40}
            required
            className={fieldErrors.lastName ? "inputError" : undefined}
          />
          {fieldErrors.lastName && <span className="errorMessage">{fieldErrors.lastName}</span>}
        </dd>
      </div>

      <div className="profileFormRow">
        <dt><label htmlFor="email">Email</label></dt>
        <dd>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your email"
            maxLength={150}
            required
            className={fieldErrors.email ? "inputError" : undefined}
          />
          {fieldErrors.email && <span className="errorMessage">{fieldErrors.email}</span>}
        </dd>
      </div>

      <div className="profileFormRow">
        <dt><label htmlFor="phone">Phone Number</label></dt>
        <dd>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Your phone number"
            maxLength={15}
            className={fieldErrors.phone ? "inputError" : undefined}
          />
          {fieldErrors.phone && <span className="errorMessage">{fieldErrors.phone}</span>}
        </dd>
      </div>

      <div className="profileFormRow">
        <dt><label htmlFor="postal_address">Postal Address</label></dt>
        <dd>
          <input
            type="text"
            id="postal_address"
            name="postal_address"
            value={formData.postal_address}
            onChange={handleChange}
            placeholder="Your postal address"
            maxLength={100}
            className={fieldErrors.postal_address ? "inputError" : undefined}
          />
          {fieldErrors.postal_address && <span className="errorMessage">{fieldErrors.postal_address}</span>}
        </dd>
      </div>

      <div className="profileFormRow">
        <dt><label htmlFor="bio">Biography</label></dt>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          placeholder="Share about yourself..."
        />
      </div>

      <div className="profileFormRow">
        <dt><label htmlFor="resume">Resume</label></dt>
        <input
          type="file"
          id="resume"
          name="resume"
          onChange={handleChange}
        />
        {fieldErrors.resume && <span className="errorMessage">{fieldErrors.resume}</span>}
      </div>

      <div className="buttonContainer">
        <button type="submit" className="profileSubmitButton" disabled={loading}>
          {submitLabel}
        </button>
        {onDiscard && (
          <button type="button" className="profileDiscardButton" onClick={onDiscard} disabled={loading}>
            DISCARD CHANGES
          </button>
        )}
      </div>
    </form>
  );
};

export default ProfileForm;