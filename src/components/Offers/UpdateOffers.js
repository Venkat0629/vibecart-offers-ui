import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchOffers,
  updateOffer,
  updateMultipleOffers,
  selectAllOffers,
  toggleOfferSelection,
  setToken
} from '../Redux/updateOfferSlice';
import './Offer.css';
import { FaCheck } from 'react-icons/fa';
import { MdOutlineCancel } from 'react-icons/md';
import { IoMdCreate } from "react-icons/io";
import { FaCircleCheck } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import Badge from 'react-bootstrap/Badge';
import { FaSearch } from "react-icons/fa";
const UpdateOffers = () => {
  const dispatch = useDispatch();
  const { offers, status, error, jwtToken } = useSelector(state => state.updateOffers);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [editableFields, setEditableFields] = useState({});
  useEffect(() => {
    const token = localStorage.getItem('token');
    dispatch(setToken(token));
    dispatch(fetchOffers(token));
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableFields(prevFields => ({
      ...prevFields,
      [name]: name === 'offerDiscountValue' ? parseFloat(value) : value
    }));
  };

  const handleSelectAllChange = (e) => {
    const { checked } = e.target;
    dispatch(selectAllOffers(checked));
  };

  const handleCheckboxChange = (id) => {
    dispatch(toggleOfferSelection(id));
  };

  const handleEdit = (id) => {
    const offerToEdit = offers.find(offer => offer.offerId === id);
    setEditingOfferId(id);
    setEditableFields({ ...offerToEdit });
  };

  const handleUpdate = () => {
    const dataToSend = {
      ...editableFields,
      offerQuantity: Number(editableFields.offerQuantity),
      offerDiscountValue: parseFloat(editableFields.offerDiscountValue),
    };
    dispatch(updateOffer({ id: editingOfferId, data: dataToSend, token: jwtToken }));
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingOfferId(null);
    setEditableFields({});
  };

  const handleSearch = () => {
    console.log(offerTypeCounts)
    console.log(offers.offerItems[0])
    // Implement search logic
  };

  const handleUpdateSelected = () => {
    const selectedOffers = offers.filter(offer => offer.selected).map(offer => offer.offerId);
    dispatch(updateMultipleOffers({ ids: selectedOffers, data: editableFields, token: jwtToken }));
  };

  const filteredOffers = offers.filter(
    (offer) =>
      offer.offerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.offerId.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderEditableCell = (name, value, type = 'text') => (
    <input
      type={type}
      name={name}
      value={editableFields[name] || ''}
      onChange={handleInputChange}
      className="form-control"
      step={type === 'number' ? 'any' : undefined} // Allow decimals for number inputs
    />
  );
  const offerTypeCounts = offers.length
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const renderEditableSelect = (name, value, options) => (
    <select
      name={name}
      value={editableFields[name] || ''}
      onChange={handleInputChange}
      className="form-control"
    >
      <option value="">Select Status</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
  // const typeCounts = offerItems.reduce((acc, item) => {
  //   acc[item.offerType] = (acc[item.offerType] || 0) + 1;
  //   return acc;
  // }, {});
  const offerTypeColors = {
    "SKU_OFFER": "bg-primary",    // Blue background
    "ITEM_OFFER": "bg-info",   // Green background
    "ON_BILL_AMOUNT": "bg-secondary", // Yellow background
    "DISCOUNT_COUPONS": "bg-dark", // Red background
  };
  return (
    <div className="update-offers-container">
      <div className="actions-container">
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search Offers"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <FaSearch className="search-icon" size={24} color='lightgrey' onClick={handleSearch} />
          </div>
        </div>
        <div className="select-all-container">
          <input
            type="checkbox"
            id="selectAll"
            checked={offers.every(offer => offer.selected)}
            onChange={handleSelectAllChange}
          />
          <label htmlFor="selectAll" className="select-all-label bg-light-grey">
            Select All
          </label>
          <button className="update-all-button" onClick={handleUpdateSelected}>
            Update All
          </button>
        </div>
      </div>
      <div className="table-container">
        <table className="offers-update-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Offer ID</th>
              <th>Offer Name</th>
              <th>Offer Type</th>
              <th>Discount Type</th>
              <th>Discount Value</th>
              <th>Offer Usage Quantity</th>
              <th>Offer Used Quantity</th>
              <th>Start Date</th>
              <th>Expiry Date</th>
              <th>Offer Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOffers.length > 0 ? (
              filteredOffers.map((offer) => (
                <tr key={offer.offerId}>
                  <td>
                    <input
                      type="checkbox"
                      checked={offer.selected || false}
                      onChange={() => handleCheckboxChange(offer.offerId)}
                    />
                  </td>
                  <td>{offer.offerId}</td>
                  <td>
                    {editingOfferId === offer.offerId
                      ? renderEditableCell('offerName', offer.offerName)
                      : offer.offerName}
                  </td>
                  <td>
                    {offer.offerItems && offer.offerItems.length > 0 ? (
                      <Badge
                        pill
                        className={offerTypeColors[offer.offerItems[0].offerType] || "bg-secondary"}
                        style={{ width: "max-content" }}
                      >
                        {offer.offerItems[0].offerType}
                        <span className="badge bg-light text-dark">{offer.offerItems.length}</span>
                      </Badge>
                    ) : (
                      <span>No Items</span> // Handle cases where offerItems is null or empty
                    )}
                  </td>

                  <td>
                    {editingOfferId === offer.offerId ? (
                      <select
                        name="offerDiscountType"
                        value={editableFields.offerDiscountType || ''}
                        onChange={handleInputChange}
                        className="form-control"
                      >
                        <option value="">Select Discount Type</option>
                        <option value="PRICE">PRICE</option>
                        <option value="PERCENTAGE">PERCENTAGE</option>
                      </select>
                    ) : (
                      offer.offerDiscountType
                    )}
                  </td>
                  <td>
                    {editingOfferId === offer.offerId
                      ? renderEditableCell('offerDiscountValue', offer.offerDiscountValue, 'number')
                      : offer.offerDiscountType === 'PRICE'
                        ? `$${offer.offerDiscountValue}`
                        : `${offer.offerDiscountValue}%`}
                  </td>
                  <td>
                    {editingOfferId === offer.offerId
                      ? renderEditableCell('offerQuantity', offer.offerQuantity, 'number')
                      : offer.offerQuantity}
                  </td>
                  <td>{offer.offerUsageQuantity}</td>
                  <td>
                    {offer.offerStartDate}
                  </td>
                  <td>
                    {editingOfferId === offer.offerId
                      ? renderEditableCell('offerEndDate', offer.offerEndDate, 'date')
                      : offer.offerEndDate}
                  </td>
                  <td>
                    {editingOfferId === offer.offerId ? (
                      renderEditableSelect('offerStatus', offer.offerStatus, [
                        { value: 'ACTIVE', label: 'Active' },
                        { value: 'INACTIVE', label: 'Inactive' }
                      ])
                    ) : (
                      offer.offerStatus
                    )}
                  </td>
                  <td>
                  {offer.offerStatus !== 'SHELVED' && (
                      <>
                    {editingOfferId === offer.offerId ? (
                      <div className="actions-buttons">
                        <FaCircleCheck onClick={handleUpdate} size={24} color='green' />
                        <MdCancel onClick={cancelEdit} size={28} color='red' />
                      </div>
                    ) : (
                      <button className="edit-button" onClick={() => handleEdit(offer.offerId)}>
                        Edit
                      </button>
                    )}</>)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="no-offers">
                  No offers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UpdateOffers;
