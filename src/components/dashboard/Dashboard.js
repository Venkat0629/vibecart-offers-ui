import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const COLORS = ['#0292fa', '#06eeee', '#010344'];

function Dashboard() {
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [totalOffers, setTotalOffers] = useState(0);
  const [activeOffers, setActiveOffers] = useState(0);
  const [expiredOffers, setExpiredOffers] = useState(0);

  useEffect(() => {
    fetch('http://localhost:5501/vibe-cart/offers')
      .then(response => response.json())
      .then(data => {
        const monthlyData = data.reduce((acc, offer) => {
          const month = new Date(offer.offerStartDate).toLocaleString('default', { month: 'short' });

          if (!acc[month]) {
            acc[month] = { name: month, ProductOffers: 0, SeasonalPromotion: 0, PriceDiscounts: 0 };
          }

          switch (offer.offerType.offerType) {
            case 'ITEMS_OFFER':
              acc[month].ProductOffers += 1;
              break;
            case 'LIMITED_TIME_OFFER':
              acc[month].SeasonalPromotion += 1;
              break;
            case 'ON_BILL_AMOUNT':
            case 'DISCOUNT_COUPONS':
              acc[month].PriceDiscounts += 1;
              break;
            default:
              break;
          }

          return acc;
        }, {});

        const barChartData = Object.values(monthlyData);
        const pieChartData = [
          { name: 'Product Offers', value: barChartData.reduce((sum, month) => sum + month.ProductOffers, 0) },
          { name: 'Seasonal Promotion', value: barChartData.reduce((sum, month) => sum + month.SeasonalPromotion, 0) },
          { name: 'Price Discounts', value: barChartData.reduce((sum, month) => sum + month.PriceDiscounts, 0) },
        ];

        setBarData(barChartData);
        setPieData(pieChartData);
        setTotalOffers(data.length);

        const active = data.filter(offer => offer.offerStatus === "ACTIVE").length;
        setActiveOffers(active);
        setExpiredOffers(data.length - active);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className='dashboard'>
      <div className='offers'>
        <div>
          <h1>{totalOffers}</h1>
          <p className="offer-description">Total offers</p>
        </div>
        <div>
          <h1>{activeOffers}</h1>
          <p className="offer-description">Active offers</p>
        </div>
        <div>
          <h1>{expiredOffers}</h1>
          <p className="offer-description">Expired offers</p>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />  {/* This line prevents decimals from appearing on the Y-axis */}
              <Tooltip />
              <Legend />
              <Bar dataKey="ProductOffers" fill="#0292fa" />
              <Bar dataKey="SeasonalPromotion" fill="#010344" />
              <Bar dataKey="PriceDiscounts" fill="#06eeee" />
            </BarChart>
          </ResponsiveContainer>

          <h3>Last 3 Months Used Offers</h3>
        </div>

        <div className="chart">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#06eeee"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <h3>Most Used Offer Types</h3>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
