import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setOffers, deleteOffer, deleteOffers,selectAllOffers,toggleOfferSelection } from '../Redux/deleteOfferSlice'; // Adjust the path as necessary

const DeleteOffers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const dispatch = useDispatch();
  
  const { offers, status, error } = useSelector((state) => state.deleteOffers);

  useEffect(() => {
    const fetchOffers = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get("http://localhost:5501/vibe-cart/offers", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        dispatch(setOffers(response.data));
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

  const filteredOffers = Array.isArray(offers) ? offers.filter(
    (offer) =>
      offer.offerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.offerId.toString().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className='deletepage-container'>
      <div className="container mt-5">
        <div className="d-flex justify-content-between mb-3">
          <div className="d-flex">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Search Offers"
              value={searchTerm}
              onChange={handleSearchChange}
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
            <label htmlFor="selectAll">Select All</label>
            <button className="btn btn-danger ms-3" onClick={handleDeleteSelected}>
              Delete Selected
            </button>
          </div>
        </div>
        <div className="table-container">
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
                    <td>{offer.offerType.offerType}</td>
                    <td>{offer.offerDiscountType}</td>
                    <td>{offer.offerDiscountType === 'FIXED_AMOUNT'
                          ? `$${offer.offerDiscountValue}`
                          : `${offer.offerDiscountValue}%`}</td>
                    <td>{offer.offerQuantity}</td>
                    <td>{offer.offerStartDate}</td>
                    <td>{offer.offerEndDate}</td>
                    <td>{offer.offerStatus}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(offer.offerId)}
                      >
                        Delete
                      </button>
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

export default DeleteOffers;
