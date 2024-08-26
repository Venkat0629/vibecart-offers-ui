import React, { useState } from 'react';
import './Offer.css';
import { FaEdit, FaCheck } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";

const initialOffers = [
  { id: 1, offerId: 'O001', offerName: 'Offer One', offerType: 'Discount', discountType: 'price', discountValue: 20, quantity: 3, startDate: '2024-01-01', expiryDate: '2024-01-10', selected: false },
  { id: 2, offerId: 'O002', offerName: 'Offer Two', offerType: 'Buy One Get One', discountType: 'percentage', discountValue: 30, quantity: 2, startDate: '2024-02-01', expiryDate: '2024-02-10', selected: false },
];

const UpdateOffers = () => {
  const [offers, setOffers] = useState(initialOffers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [editableFields, setEditableFields] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableFields(prevFields => ({ ...prevFields, [name]: value }));
  };

  const handleSelectAllChange = (e) => {
    const { checked } = e.target;
    setSelectAll(checked);
    setOffers(prevOffers =>
      prevOffers.map(offer => ({ ...offer, selected: checked }))
    );
  };

  const handleCheckboxChange = (id) => {
    setOffers(prevOffers =>
      prevOffers.map(offer =>
        offer.id === id ? { ...offer, selected: !offer.selected } : offer
      )
    );
  };

  const handleEdit = (id) => {
    const offerToEdit = offers.find(offer => offer.id === id);
    setEditingOfferId(id);
    setEditableFields({ ...offerToEdit });
  };

  const handleUpdate = () => {
    setOffers(prevOffers =>
      prevOffers.map(offer =>
        offer.id === editingOfferId ? { ...editableFields } : offer
      )
    );
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingOfferId(null);
    setEditableFields({});
  };

  const handleSearch = () => {
    console.log('Search term:', searchTerm);
  };

  const handleUpdateSelected = () => {
    const selectedOffers = offers.filter(offer => offer.selected);
    console.log('Selected offers for bulk update:', selectedOffers);
  };

  const filteredOffers = offers.filter(
    (offer) =>
      offer.offerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.offerId.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  const renderEditableCell = (name, value, type = 'text') => (
    <input
      type={type}
      name={name}
      value={editableFields[name] || ''}
      onChange={handleInputChange}
      className="form-control"
    />
  );

  return (
    <div className='updatepage-container'>
      <div className="container mt-5">
        <div className="d-flex justify-content-between mb-3">
          <div className="d-flex">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Search Offers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleSearch}>
              Search
            </button>
          </div>
          <div className="d-flex align-items-center">
            <input
              type="checkbox"
              id="selectAll"
              checked={selectAll}
              onChange={handleSelectAllChange}
            />
            <label htmlFor="selectAll" className="ms-2">Select All</label>
            <button className="btn btn-warning ms-3" onClick={handleUpdateSelected}>
              Update All
            </button>
          </div>
        </div>
        <div className="table-responsive table-container">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>Select</th>
                <th>Offer ID</th>
                <th>Offer Name</th>
                <th>Offer Type</th>
                <th>Discount Type</th>
                <th>Discount Value</th>
                <th>Quantity</th>
                <th>Start Date</th>
                <th>Expiry Date</th>
                {/* <th>Offer Status</th> */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOffers.length > 0 ? (
                filteredOffers.map(offer => (
                  <tr key={offer.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={offer.selected}
                        onChange={() => handleCheckboxChange(offer.id)}
                      />
                    </td>
                    <td>{offer.offerId}</td>
                    <td>
                      {editingOfferId === offer.id
                        ? renderEditableCell('offerName', offer.offerName)
                        : offer.offerName}
                    </td>
                    <td>
                      {editingOfferId === offer.id
                        ? renderEditableCell('offerType', offer.offerType)
                        : offer.offerType}
                    </td>
                    <td>
                      {editingOfferId === offer.id
                        ? renderEditableCell('discountType', offer.discountType)
                        : offer.discountType}
                    </td>
                    <td>
                      {editingOfferId === offer.id
                        ? renderEditableCell('discountValue', offer.discountValue, 'number')
                        : offer.discountType === 'price'
                        ? `$${offer.discountValue}`
                        : `${offer.discountValue}%`}
                    </td>
                    <td>
                      {editingOfferId === offer.id
                        ? renderEditableCell('quantity', offer.quantity, 'number')
                        : offer.quantity}
                    </td>
                    <td>
                      {editingOfferId === offer.id
                        ? renderEditableCell('startDate', offer.startDate, 'date')
                        : offer.startDate}
                    </td>
                    <td>
                      {editingOfferId === offer.id
                        ? renderEditableCell('expiryDate', offer.expiryDate, 'date')
                        : offer.expiryDate}
                    </td>
                    {/* <td>
                      {editingOfferId === offer.id ? (
                        <select
                          name="offerStatus"
                          value={editableFields.offerStatus || 'Active'}
                          onChange={handleInputChange}
                          className="form-control"
                        >
                          <option value="InActive">In Active</option>
                          <option value="Active">Active</option>
                          <option value="Deactivate">Deactivate</option>
                        </select>
                      ) : (
                        offer.offerStatus
                      )}
                    </td> */}
                    <td>
                      {editingOfferId === offer.id ? (
                        <div className='d-flex'>
                          <button className="btn btn-success btn-sm me-2" onClick={handleUpdate}><FaCheck /></button>
                          <button className="btn btn-danger btn-sm" onClick={cancelEdit}><MdOutlineCancel size={24} /></button>
                        </div>
                      ) : (
                        <button className="btn btn-info btn-sm me-2" onClick={() => handleEdit(offer.id)}><FaEdit /></button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center">No Offers Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UpdateOffers;
