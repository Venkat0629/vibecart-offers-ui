import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css';

// New color scheme
const COLORS = ['#dd1e25', '#fbb3b5', '#c1121f', '#f08080'];

function Dashboard() {
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [totalOffers, setTotalOffers] = useState(0);
  const [activeOffers, setActiveOffers] = useState(0);
  const [expiredOffers, setExpiredOffers] = useState(0);

  useEffect(() => {
    fetch('http://localhost:5501/api/v1/vibe-cart/offers')
      .then(response => response.json())
      .then(data => {
        const currentDate = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

        const filteredData = data.filter(offer => {
          const offerDate = new Date(offer.offerStartDate);
          return offerDate >= threeMonthsAgo;
        });

        const monthlyData = filteredData.reduce((acc, offer) => {
          const month = new Date(offer.offerStartDate).toLocaleString('default', { month: 'short' });

          if (!acc[month]) {
            acc[month] = { name: month, ProductOffers: 0, SeasonalPromotion: 0, PriceDiscounts: 0 };
          }

          offer.offerItems.forEach(item => {
            switch (item.offerType) {
              case 'ITEM_OFFER':
                acc[month].ProductOffers += 1;
                break;
              case 'SKU_OFFER':
                acc[month].SeasonalPromotion += 1;
                break;
              case 'ON_BILL_AMOUNT':
              case 'DISCOUNT_COUPONS':
                acc[month].PriceDiscounts += 1;
                break;
              default:
                break;
            }
          });

          return acc;
        }, {});

        // Convert to array and filter out unwanted months (e.g., June and August)
        const barChartData = Object.values(monthlyData).filter(monthData => !['Jun', 'Aug'].includes(monthData.name));

        const pieChartData = [
          { name: 'Product Offers', value: barChartData.reduce((sum, month) => sum + month.ProductOffers, 0) },
          { name: 'Seasonal Promotion', value: barChartData.reduce((sum, month) => sum + month.SeasonalPromotion, 0) },
          { name: 'Price Discounts', value: barChartData.reduce((sum, month) => sum + month.PriceDiscounts, 0) },
        ];

        setBarData(barChartData);
        setPieData(pieChartData);
        setTotalOffers(filteredData.length);

        const active = filteredData.filter(offer => offer.offerStatus === "ACTIVE").length;
        setActiveOffers(active);
        setExpiredOffers(filteredData.length - active);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="container mt-4 style={{ fontSize: '14px' }}">
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-header bg-light-grey bold">
              Total offers
            </div>
            <div className="card-body">
              <h1 className="card-title">{totalOffers}</h1>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-header bg-light-grey bold">
              Active offers
            </div>
            <div className="card-body">
              <h1 className="card-title">{activeOffers}</h1>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-header bg-light-grey bold">
              Expired offers
            </div>
            <div className="card-body">
              <h1 className="card-title">{expiredOffers}</h1>
            </div>
          </div>
        </div>
      </div>



      <div className="row mb-4">
  <div className="col-md-6 mb-4">
    <div className="card">
      <div className="card-header bg-light-grey text-center bold">
        Last 3 Months Used Offers
      </div>
      <div className="card-body p-3">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="ProductOffers" fill={COLORS[0]} />
            <Bar dataKey="SeasonalPromotion" fill={COLORS[1]} />
            <Bar dataKey="PriceDiscounts" fill={COLORS[2]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>

  <div className="col-md-6 mb-4">
    <div className="card">
      <div className="card-header bg-light-grey text-center bold">
        Most Used Offer Types
      </div>
      <div className="card-body p-3">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={0} // Set innerRadius to 0 for a simple pie chart
              outerRadius={90} // Adjust outerRadius as needed
              fill={COLORS[3]}
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
      </div>
    </div>
  </div>
</div>

    </div>
  );
}

export default Dashboard;
