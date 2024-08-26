import React, { useState } from 'react';

const DeleteOffers = () => {
  const [offers, setOffers] = useState([
    { id: 1, offerId: 'O001', offerName: 'Offer One', offerType: 'Discount', discountType: 'price', discountValue: 20, quantity: 3, startDate: '2024-01-01', expiryDate: '2024-01-10', selected: false },
    { id: 2, offerId: 'O002', offerName: 'Offer Two', offerType: 'Buy One Get One', discountType: 'percentage', discountValue: 30, quantity: 2, startDate: '2024-02-01', expiryDate: '2024-02-10', selected: false },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    console.log('Search term:', searchTerm);
  };

  const handleSelectAllChange = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    setOffers((prevOffers) =>
      prevOffers.map((offer) => ({ ...offer, selected: isChecked }))
    );
  };

  const handleCheckboxChange = (id) => {
    setOffers((prevOffers) =>
      prevOffers.map((offer) =>
        offer.id === id ? { ...offer, selected: !offer.selected } : offer
      )
    );
  };

  const handleDeleteSelected = () => {
    setOffers((prevOffers) => prevOffers.filter((offer) => !offer.selected));
    setSelectAll(false); 
  };

  const handleDelete = (id) => {
    setOffers((prevOffers) => prevOffers.filter((offer) => offer.id !== id));
  };

  const filteredOffers = offers.filter(
    (offer) =>
      offer.offerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.offerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOffers.length > 0 ? (
                filteredOffers.map((offer) => (
                  <tr key={offer.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={offer.selected}
                        onChange={() => handleCheckboxChange(offer.id)}
                      />
                    </td>
                    <td>{offer.offerId}</td>
                    <td>{offer.offerName}</td>
                    <td>{offer.offerType}</td>
                    <td>{offer.discountType}</td>
                    <td>{offer.discountValue}</td>
                    <td>{offer.quantity}</td>
                    <td>{offer.startDate}</td>
                    <td>{offer.expiryDate}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(offer.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center">No Offers Found</td>
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
