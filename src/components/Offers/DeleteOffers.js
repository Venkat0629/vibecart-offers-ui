import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setOffers, deleteOffer, deleteOffers, selectAllOffers, toggleOfferSelection } from '../Redux/deleteOfferSlice'; // Adjust the path as necessary
import './Offer.css';
import { RiDeleteBin6Line } from "react-icons/ri";
import Badge from 'react-bootstrap/Badge';
import { FaSearch } from "react-icons/fa";
const DeleteOffers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const dispatch = useDispatch();

  const { offers, status, error } = useSelector((state) => state.deleteOffers);

  useEffect(() => {
    const fetchOffers = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get("http://localhost:5501/api/v1/vibe-cart/offers", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        let mydata = response.data;
        const sortedOffers = mydata.sort((a, b) => new Date(b.offerCreatedAt) - new Date(a.offerCreatedAt));;
        console.log(sortedOffers);
        dispatch(setOffers(sortedOffers));
      } catch (err) {
        console.error('Error fetching offers:', err);
      }
    };

    fetchOffers();
  }, [dispatch]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    console.log('Search term:', searchTerm);
  };

  const handleSelectAllChange = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    dispatch(selectAllOffers(isChecked));
  };

  const handleCheckboxChange = (id) => {
    dispatch(toggleOfferSelection(id));
  };

  const handleDeleteSelected = async () => {
    const selectedOffers = offers.filter(offer => offer.selected).map(offer => offer.offerId);

    try {
      await dispatch(deleteOffers(selectedOffers)).unwrap();
      setSelectAll(false);
    } catch (error) {
      console.error('Error deleting selected offers:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteOffer(id)).unwrap();
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
  };
  const filteredOffers = Array.isArray(offers) ? offers
  .filter(
    (offer) =>
      offer.offerStatus !== 'SHELVED' && // Exclude SHELVED offers
      (offer.offerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.offerId.toString().includes(searchTerm.toLowerCase()))
  ) : [];

  const offerTypeColors = {
    "SKU_OFFER": "bg-primary",    // Blue background
    "ITEM_OFFER": "bg-info",   // Green background
    "ON_BILL_AMOUNT": "bg-secondary", // Yellow background
    "DISCOUNT_COUPONS": "bg-dark", // Red background
  };
  return (
    <div className='deletepage-container'>
      <div className="deletepage-content">
        <div className="search-and-select">
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
              checked={selectAll}
              onChange={handleSelectAllChange}
            />
            <label htmlFor="selectAll" className="select-all-label">Select All</label>
            <button className="delete-selected-button" onClick={handleDeleteSelected}>
              Delete Selected
            </button>
          </div>

        </div>
        <div className="table-container">
          <table className="offers-delete-table">
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
                    <td>{offer.offerName}</td>
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
                    <td>{offer.offerDiscountType}</td>
                    <td>{offer.offerDiscountType === 'FIXED_AMOUNT'
                      ? `$${offer.offerDiscountValue}`
                      : `${offer.offerDiscountValue}%`}</td>
                    <td>{offer.offerQuantity}</td>
                    <td>{offer.offerUsageQuantity}</td>
                    <td>{offer.offerStartDate}</td>
                    <td>{offer.offerEndDate}</td>
                    <td>{offer.offerStatus}</td>
                    <td>
                      < RiDeleteBin6Line className="delete-button"
                        onClick={() => handleDelete(offer.offerId)} size={24} color='red' />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="no-offers">No Offers Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeleteOffers;
