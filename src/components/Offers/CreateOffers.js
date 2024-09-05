import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createOffer, resetForm, setOfferDetails } from '../Redux/offerSlice';
import { MdCancel } from "react-icons/md";
import { IoAddCircleSharp } from "react-icons/io5";
import axios from 'axios';
import Select from 'react-select';
import './Offer.css'; // Import your custom CSS file

const CreateOffer = () => {
  const dispatch = useDispatch();
  const { offerDetails , loading, error, success } = useSelector((state) => state.offers);
  const [formErrors, setFormErrors] = useState({});
  const [newItem, setNewItem] = useState([]);
  const [newItemIds, setNewItemIds] = useState([]); // Changed to store multiple item IDs
  const [newskuIds, setNewSkuIds] = useState([]); // Changed to store multiple item IDs
  const [availableSkus, setAvailableSkus] = useState([]);
  const [skuValidationError, setSkuValidationError] = useState('');
  const [itemValidationError, setItemValidationError] = useState('');
  const [invalidItemError, setInvalidItemError] = useState('');
  const [itemlevelSku,setItemLevelsku]=useState([]);
  const [formData, setFormData] = useState({
    offerType: "",
    skuId: '',
    itemId: '',
    billAmount: 0.0,
    couponCode: ""
  });
  const fetchAvailableSkus = async (itemId) => {
    try {
      const response = await axios.get(`http://localhost:8080/vibecart/ecom/items/item/${itemId}/skuIDs`);
      if (Array.isArray(response.data.skuIDs)) {
        setAvailableSkus(response.data.skuIDs.map(sku => ({ value: sku, label: sku })));
        setInvalidItemError(''); 
        setAvailableSkus([]);
        setInvalidItemError('Invalid item ID.'); 
      }
    } catch (error) {
      console.error('Error fetching SKUs:', error);
      setAvailableSkus([]);
      setInvalidItemError('Error fetching SKUs.'); 
    }
  };

  const validateSku = async (sku) => {
    if (!sku) {
      setSkuValidationError('SKU cannot be empty.');
      return;
    }
    
    try {
      const response = await axios.get(`http://localhost:8080/vibecart/ecom/products/product/sku-id/${sku}`);
      
      // Assuming response.data contains { skuID, itemID, ... }
      const { skuID, itemID } = response.data;
      
      if (skuID && itemID) {
        // Update state with new offer item
        setNewItem(prevOfferItems => [
          ...prevOfferItems,
          {
            offerType: formData.offerType,
            offerOn: "SKU",
            skuId: skuID,
            itemId: itemID,
            billAmount: 0.0,
            couponCode: ""
          }
        ]);
       console.log(newItem) 
        setSkuValidationError('');
      } else {
        setSkuValidationError('Invalid SKU.');
      }
    } catch (error) {
      setSkuValidationError('Error validating SKU.');
    }
  };
  

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    console.log(e.target.value);
    setFormData(prevState => ({ ...prevState, [id]: value }));

    if (id === 'skuId') {
      validateSku(value);
    }
    if (id === 'couponCode' && formData.offerType === 'DISCOUNT_COUPONS') {
      const myData = {
        offerType: formData.offerType,
        offerOn: 'NA',
        skuId: null,
        itemId: null,
        billAmount: 0.0, 
        couponCode: value, 
      };
      setNewItem(myData);
    }  else if (id === 'billAmount') {
      const myData = {
        offerType: formData.offerType,
        offerOn: 'NA',
        skuId: null,
        itemId: null,
        billAmount: value, 
        couponCode: null, 
      };
      setNewItem(myData);
    }
  };





  const removeOfferItem = (index) => {
    const updatedItems = (offerDetails.offerItems || []).filter((_, idx) => idx !== index);
    dispatch(setOfferDetails({ offerItems: updatedItems }));
  };
  const validateItemId = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:8080/vibecart/ecom/items/item/${itemId}/skuIDs`);
      const data = await response.json();
      if (response.ok && data.skuIDs) {
        const myItems = data.skuIDs.map(sku => ({
          offerType: formData.offerType,
          offerOn: 'ITEM',
          skuId: sku,
          itemId: parseInt(itemId),
          billAmount: 0.0,
          couponCode: null
        }));  
        console.log(myItems);
        setNewItem(prevItems => [...prevItems, ...myItems])     
        return true; 
      } else {
        return false; 
      }
    } catch (error) {
      console.error('Error validating item ID:', error);
      return false;
    }
  };
  const handleItemIdChange = async (e) => {
    const itemId = e.target.value.trim();
    setFormData(prevState => ({
      ...prevState,
      itemId: itemId 
    }));

    if (itemId) {
      const isValid = await validateItemId(itemId);
      if (isValid) {
        setItemValidationError(''); 
        fetchAvailableSkus(itemId); 
      } else {
        setItemValidationError(`Invalid item ID: ${itemId}`);
        setAvailableSkus([]);
      }
    } else {
      setItemValidationError('Item ID cannot be empty.');
      setAvailableSkus([]); 
    }
  };
  const addItemId = () => {
    if (formData.itemId) {
      setNewItemIds(prevState => [...prevState, formData.itemId]);
      setFormData(prevState => ({ ...prevState, itemId: '' }));
      setItemValidationError('');
    } else {
      setItemValidationError('Item ID cannot be empty.');
    }
  };

  const removeItemId = (itemIdToRemove) => {
    setNewItemIds(prevState => prevState.filter(id => id !== itemIdToRemove));
  };
  const addSku = ()=>{
    if(formData.skuId){
      setNewSkuIds(prevState => [...prevState, formData.skuId]);
      setFormData(prevState => ({ ...prevState, skuId: '' }));

    }else{
      console.log(error)
    }
   
  }
  const removeSkuId = (skuIdToRemove) => {
    setNewSkuIds(prevState => prevState.filter(id => id !== skuIdToRemove));
  };
  
  const validateForm = () => {
    const errors = {};

    if (!offerDetails.offerName) errors.offerName = 'Offer Name is required.';
    if (!offerDetails.offerDiscountType) errors.offerDiscountType = 'Discount Type is required.';
    if (offerDetails.offerDiscountType && offerDetails.offerDiscountValue <= 0) {
      errors.offerDiscountValue = `${offerDetails.offerDiscountType === 'FIXED_AMOUNT' ? 'Discount Amount' : 'Discount Percentage'} is required and must be greater than 0.`;
    }
    if (offerDetails.offerQuantity <= 0) errors.offerQuantity = 'Quantity is required and must be greater than 0.';
    if (!offerDetails.offerStartDate) errors.offerStartDate = 'Start Date is required.';
    if (!offerDetails.offerEndDate) errors.offerEndDate = 'End Date is required.';

    if (offerDetails.offerStartDate && offerDetails.offerEndDate) {
      if (new Date(offerDetails.offerStartDate) >= new Date(offerDetails.offerEndDate)) {
        errors.offerEndDate = 'End Date must be greater than Start Date.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
   console.log({...offerDetails,offerItems:[newItem]})
   
   console.log(newItem)
    if (validateForm()) {
      dispatch(createOffer(offerDetails));
    }
  };

  useEffect(() => {
    if (newItem.itemId) {
      fetchAvailableSkus(newItem.itemId);
    }
  }, [newItem.itemId]);

  useEffect(() => {
    if (success) {
      alert('Offer created successfully');
      dispatch(resetForm());
    }
  }, [success, dispatch]);

  return (
    <div className="offer-container">
      <div className="offer-card">
        <h4>Add New Offer</h4>
        <form onSubmit={handleFormSubmit}>
          <div className="form-row">
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="offerName">Offer Name</label>
                <input
                  type="text"
                  id="offerName"
                  value={offerDetails.offerName || ''}
                  onChange={(e) => dispatch(setOfferDetails({ offerName: e.target.value }))}
                  className={formErrors.offerName ? 'input-error' : ''}
                />
                {formErrors.offerName && <span className="error">{formErrors.offerName}</span>}
              </div>
            </div>

            <div className="form-column">
              <div className="form-group">
                <label htmlFor="offerQuantity">Offer Quantity</label>
                <input
                  type="number"
                  id="offerQuantity"
                  value={offerDetails.offerQuantity}
                  onChange={(e) => dispatch(setOfferDetails({ offerQuantity:parseInt(e.target.value)}))}
                  className={formErrors.offerQuantity ? 'input-error' : ''}
                />
                {formErrors.offerQuantity && <span className="error">{formErrors.offerQuantity}</span>}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="offerDiscountType">Discount Type</label>
                <select
                  id="offerDiscountType"
                  value={offerDetails.offerDiscountType || ''}
                  onChange={(e) => dispatch(setOfferDetails({ offerDiscountType: e.target.value }))}
                  className={formErrors.offerDiscountType ? 'input-error' : ''}
                >
                  <option value="">Select Discount Type</option>
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED_AMOUNT">Fixed Amount</option>
                </select>
                {formErrors.offerDiscountType && <span className="error">{formErrors.offerDiscountType}</span>}
              </div>
            </div>

            {offerDetails.offerDiscountType && (
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="offerDiscountValue">Discount Value</label>
                  <input
                    type="number"
                    id="offerDiscountValue"
                    value={offerDetails.offerDiscountValue || ''}
                    onChange={(e) => dispatch(setOfferDetails({ offerDiscountValue: parseInt(e.target.value )}))}
                    className={formErrors.offerDiscountValue ? 'input-error' : ''}
                  />
                  {formErrors.offerDiscountValue && <span className="error">{formErrors.offerDiscountValue}</span>}
                </div>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="offerStartDate">Start Date</label>
                <input
                  type="date"
                  id="offerStartDate"
                  value={offerDetails.offerStartDate || ''}
                  onChange={(e) => dispatch(setOfferDetails({ offerStartDate: e.target.value }))}
                  className={formErrors.offerStartDate ? 'input-error' : ''}
                />
                {formErrors.offerStartDate && <span className="error">{formErrors.offerStartDate}</span>}
              </div>
            </div>

            <div className="form-column">
              <div className="form-group">
                <label htmlFor="offerEndDate">End Date</label>
                <input
                  type="date"
                  id="offerEndDate"
                  value={offerDetails.offerEndDate || ''}
                  onChange={(e) => dispatch(setOfferDetails({ offerEndDate: e.target.value }))}
                  className={formErrors.offerEndDate ? 'input-error' : ''}
                />
                {formErrors.offerEndDate && <span className="error">{formErrors.offerEndDate}</span>}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="offerType">Offer Type</label>
                <select
                  id="offerType"
                  value={newItem.offerType}
                  onChange={(e) => setFormData(prevState => ({ ...prevState, offerType: e.target.value }))}
                >                  
                 <option value="">Select OfferType</option>
                  <option value="SKU_OFFER">SKU OFFER</option>
                  <option value="ITEM_OFFER">ITEM OFFER</option>
                  <option value="ON_BILL_AMOUNT">ON_BILL_AMOUNT</option>
                  <option value="DISCOUNT_COUPONS">DISCOUNT_COUPONS</option>
                </select>
              </div>
            </div>

            {formData.offerType === 'SKU_OFFER' && (
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="skuId">Enter SKUs</label>
                  <input
                    type="number"
                    id="skuId"
                    value={formData.skuId}
                    onChange={handleInputChange}
                  />
                    <button type="button" onClick={addSku} disabled={!formData.skuId}>Add Skus</button>
            {newskuIds.length > 0 && (
            <div className="item-ids-container">
              {newskuIds.map((skuId, index) => (
                <div key={index} className="item-id">
                  <span>{skuId}</span>
                  <MdCancel onClick={() => removeSkuId(skuId)} className="remove-item-icon" />
                </div>
              ))}
            </div>
          )}
                  {skuValidationError && <span className="error">{skuValidationError}</span>}
                </div>
              </div>
            )}

            {formData.offerType === 'ITEM_OFFER' && (
              <>
                <div className="form-column">
                  <div className="form-group">
                    <label htmlFor="itemId">Enter Item ID</label>
                    <input
                      type="number"
                      id="itemId"
                      value={formData.itemId}
                      onChange={handleItemIdChange}
                      className={itemValidationError ? 'input-error' : ''}
                    />
            <button type="button" onClick={addItemId} disabled={!formData.itemId}>Add Item ID</button>
            {newItemIds.length > 0 && (
            <div className="item-ids-container">
              {newItemIds.map((itemId, index) => (
                <div key={index} className="item-id">
                  <span>{itemId}</span>
                  <MdCancel onClick={() => removeItemId(itemId)} className="remove-item-icon" />
                </div>
              ))}
            </div>
          )}
                    {itemValidationError && <span className="error">{itemValidationError}</span>}
                  </div>
                
                </div>

            
              </>
            )}
            {formData.offerType === 'DISCOUNT_COUPONS' && (
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="couponCode">Enter Coupon Code</label>
                  <input
                    type="number"
                    id="couponCode"
                    value={formData.couponCode || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}
            {formData.offerType === 'ON_BILL_AMOUNT' && (
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="billAmount">Enter Bill Amount</label>
                  <input
                    type="number"
                    id="billAmount"
                    value={formData.billAmount || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}
          </div>


          <div className="form-group">
            <label htmlFor="offerDescription">Offer Description</label>
            <textarea
              id="offerDescription"
              value={offerDetails.offerDescription || ''}
              onChange={(e) => dispatch(setOfferDetails({ offerDescription: e.target.value }))}
              rows="2"
            />
          </div>
          <div className="offer-items-list">
            {(offerDetails.offerItems || []).map((item, index) => (
              <div key={index} className="offer-item">
                <p>Offer Type: {item.offerType}</p>
                {item.offerType === 'SKU_OFFER' && <p>SKU IDs: {item.skuId.join(', ')}</p>}
                {item.offerType === 'ITEM_OFFER' && <p>Item IDs: {item.itemIds.join(', ')}</p>
                }
                <button type="button" onClick={() => removeOfferItem(index)} className="remove-item-btn">
                  <MdCancel />
                </button>
              </div>
            ))}
          </div>

          <div className="form-group">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating Offer...' : 'Create Offer'}
            </button>
          </div>


        </form>
      </div>
    </div>
  );
};

export default CreateOffer;
